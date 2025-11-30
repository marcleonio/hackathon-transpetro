package com.hackathonbrasil.transpetro.service;

import com.hackathonbrasil.transpetro.model.ConsolidatedRecord;
import com.hackathonbrasil.transpetro.model.RevestimentoDetail;
import com.hackathonbrasil.transpetro.model.ShipDetail;
import com.hackathonbrasil.transpetro.model.TrainingDataRecord;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVRecord;
import org.apache.commons.math3.stat.regression.OLSMultipleLinearRegression;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.FileReader;
import java.io.IOException;
import java.io.Reader;
import java.text.Normalizer;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ModelService {
    // Mapeia NavioID -> Data da Última Docagem
    Map<String, LocalDate> lastDockingMap = new HashMap<>();
    //Mapeia NavioID -> CFI_Limpo (Consumo Ideal Específico)
    Map<String, Double> cfiCleanMap = new HashMap<>();

    private final Map<String, ShipDetail> shipDetailsMap = new HashMap<>();


    private final Map<String, RevestimentoDetail> revestimentosMap = new HashMap<>();

    // Constantes de Limites
    private static final int DAYS_POST_CLEANING_START = 3; // Começa a contar a partir do 3º dia
    private static final int DAYS_POST_CLEANING_END = 7;   // Último dia para o cálculo da média
    private static final double FALLBACK_CFI = 25.0; // Se não houver dados limpos, usa um valor padrão.
    private double HPI_BASELINE_CONSUMPTION = FALLBACK_CFI;

    private OLSMultipleLinearRegression trainedModel;

    // --- GETTER (MANTIDO) ---
    public OLSMultipleLinearRegression getTrainedModel() {
        return trainedModel;
    }

    private static final String DOCAGEM_FILE = "dados_docagem.csv"; // Arquivo com as docagens
    private static final String REVESTIMENTO_FILE = "revestimento.csv";
    private static final String SHIP_DETAILS_FILE = "dados_navio.csv"; // Arquivo que acabamos de criar

    /**
     * Lê o arquivo de docagem e retorna a data de docagem mais recente para cada navio.
     */
    private Map<String, LocalDate> loadDockingDates(String filePath) throws IOException {


        try (Reader in = new FileReader(new ClassPathResource(filePath).getFile())) {

            // Assumindo cabeçalhos: Navio, Docagem, Tipo
            Iterable<CSVRecord> records = CSVFormat.DEFAULT
                    .builder()
                    .setHeader("Navio", "Docagem", "Tipo")
                    .setSkipHeaderRecord(true)
                    .build()
                    .parse(in);

            for (CSVRecord record : records) {
                String shipName = normalizeShipId(record.get("Navio"));
                String dateString = record.get("Docagem").trim();

                if (shipName.isEmpty() || dateString.isEmpty()) continue;

                // Tenta parsear no formato Mês/Dia/Ano (M/D/YYYY)
                LocalDate dockingDate = parseDockingDate(dateString);

                if (dockingDate != null) {
                    // Lógica: Mantém apenas a data mais recente
                    lastDockingMap.compute(shipName, (k, existingDate) ->
                        (existingDate == null || dockingDate.isAfter(existingDate)) ? dockingDate : existingDate
                    );
                }
            }
        }
        return lastDockingMap;
    }

    /**
     * Método específico para parsear a data de docagem (Ex: 6/30/2023)
     */
    private LocalDate parseDockingDate(String dateString) {
        // Formato M/D/YYYY ou M/DD/YYYY ou MM/D/YYYY, etc.
        try {
            String[] parts = dateString.split("/");
            if (parts.length == 3) {
                return LocalDate.of(
                    Integer.parseInt(parts[2].trim()), // Ano
                    Integer.parseInt(parts[0].trim()), // Mês
                    Integer.parseInt(parts[1].trim())  // Dia
                );
            }
        } catch (Exception ignored) {
            // Se a data estiver no formato D/M/YYYY (inverso), a exceção é pega aqui.
        }
        return null;
    }

    public void carregarDadosRevestimento(String filePath) throws IOException {

        try (Reader in = new FileReader(new ClassPathResource(filePath).getFile())) {

            // ... (configuração do CSVFormat: verifique se o header reflete todas as colunas) ...
            Iterable<CSVRecord> records = CSVFormat.DEFAULT
                .builder()
                .setHeader("Sigla", "Nome do navio", "TipoClass", "TipoCarga", "ClasseNum", "Data da aplicacao", "Cr1. Período base de verificação", "Cr1. Parada máxima acumulada no período")
                .setSkipHeaderRecord(true)
                .build()
                .parse(in);

            for (CSVRecord record : records) {
                String shipName = normalizeShipId(record.get("Nome do navio"));
                String dateString = record.get("Data da aplicacao").trim();
                String periodo = record.get("Cr1. Período base de verificação").trim();

                // Tenta parsear a data de aplicação (formato M/D/YYYY)
                LocalDate dataAplicacao = parseDockingDate(dateString);

                if (dataAplicacao == null) continue;

                int periodoBase = Integer.parseInt(periodo);

                // CRÍTICO: Atualiza ou insere, mantendo SOMENTE o revestimento com a data de aplicação MAIS RECENTE
                revestimentosMap.compute(shipName, (k, existingDetail) -> {
                    if (existingDetail == null || dataAplicacao.isAfter(existingDetail.getDataAplicacao())) {
                        // Novo registro ou registro mais recente encontrado
                        return new RevestimentoDetail(shipName, periodoBase, dataAplicacao);
                    }
                    return existingDetail; // Mantém o registro existente (mais recente)
                });
            }
        }
    }

    /**
     * Carrega os detalhes físicos e de classe do navio para o mapeamento HPI Dinâmico.
     */
    public void loadShipDetails(String filePath) throws IOException {

        try (Reader in = new FileReader(new ClassPathResource(filePath).getFile())) {

            // Headers baseados no CSV fornecido:
            Iterable<CSVRecord> records = CSVFormat.DEFAULT
                    .builder()
                    .setHeader("Nome do navio", "Classe", "Tipo", "Porte Bruto", "Comprimento total (m)", "Boca (m)", "Calado (m)", "Pontal (m)")
                    .setSkipHeaderRecord(true)
                    .build()
                    .parse(in);

            for (CSVRecord record : records) {

                String shipName = normalizeShipId(record.get("Nome do navio"));
                String shipClass = record.get("Classe").trim();
                String cargoType = record.get("Tipo").trim();

                if (shipName.isEmpty()) continue;

                try {
                    // Porte Bruto (Deadweight Tonnage) é a chave para a regra HPI
                    double dWT = Double.parseDouble(record.get("Porte Bruto").trim());

                    ShipDetail detail = new ShipDetail(shipName, shipClass, cargoType, dWT);
                    shipDetailsMap.put(shipName, detail);

                } catch (NumberFormatException ignored) {
                    // Ignora linhas com Porte Bruto inválido
                }
            }
        }
        System.out.println("   - Detalhes de " + shipDetailsMap.size() + " navios carregados.");
    }

    // --- PIPELINE DE TREINAMENTO (Pode ser chamado pelo @PostConstruct ou @Bean) ---
    public void initDataAndTrainModel() {
        try {
            System.out.println("Iniciando pipeline de processamento e treinamento...");

            loadShipDetails(SHIP_DETAILS_FILE);
            System.out.println("Detalhes do Navio (Classe/Porte Bruto) Carregados.");

            // Carrega as datas de docagem (100% limpeza)
            Map<String, LocalDate> lastCleaningMap = loadDockingDates(DOCAGEM_FILE);
            System.out.println("Datas de Docagem (Limpeza 100%) Carregadas: " + lastCleaningMap.size() + " navios.");

            // 1. CONSOLIDAÇÃO
            List<ConsolidatedRecord> rawData = consolidateDataFromFiles();
            System.out.println("Etapa 1: Consolidação concluída. Total de registros válidos: " + rawData.size());

            // 1.5 - Calcula o CFI Específico
            calculateCfiClean(rawData, lastCleaningMap);
            double baselineCfiForHPI = cfiCleanMap.values().stream()
                                    .mapToDouble(Double::doubleValue)
                                    .average().orElse(FALLBACK_CFI);

            // ATUALIZA A CONSTANTE GLOBAL PARA QUE featureEngineering A USE
            HPI_BASELINE_CONSUMPTION = baselineCfiForHPI;
            System.out.println("Etapa 1.5: Calcula o CFI Específico: " + HPI_BASELINE_CONSUMPTION);

            // 2. ENGENHARIA DE FEATURES: Passa o mapa de docagem
            List<TrainingDataRecord> trainingData = featureEngineering(rawData, lastCleaningMap);
            System.out.println("Etapa 2: Engenharia de Features concluída. Dados para treino: " + trainingData.size());


            carregarDadosRevestimento(REVESTIMENTO_FILE);
            System.out.println("Etapa 2.5: dados do revestimento");

            // 3. TREINAMENTO
            trainModel(trainingData);

            System.out.println("✅ Etapa 3: Treinamento concluído. Coeficientes calculados.");

        } catch (IOException e) {
            System.err.println("❌ Erro no pipeline. Verifique arquivos CSV/formato de data.");
            e.printStackTrace();
        }
    }

    // --- MÉTODOS DE LEITURA E CONSOLIDAÇÃO ---

    private List<ConsolidatedRecord> consolidateDataFromFiles() throws IOException {
        final String CONSUMO_FILE = "ResultadoQueryConsumo.csv";
        final String EVENTOS_FILE = "ResultadoQueryEventos.csv";

        Map<String, Double> consumptionMap = readConsumptionData(CONSUMO_FILE);

        return readEventDataAndJoin(EVENTOS_FILE, consumptionMap);
    }

    private Map<String, Double> readConsumptionData(String filePath) throws IOException {
        Map<String, Double> consumptionMap = new HashMap<>();

        try (Reader in = new FileReader(new ClassPathResource(filePath).getFile())) {
            Iterable<CSVRecord> records = CSVFormat.DEFAULT
                    .builder()
                    .setHeader("SESSION_ID", "CONSUMED_QUANTITY", "DESCRIPTION")
                    .setSkipHeaderRecord(true)
                    .build()
                    .parse(in);

            for (CSVRecord record : records) {
                String sessionId = record.get("SESSION_ID");
                try {
                    double quantity = Double.parseDouble(record.get("CONSUMED_QUANTITY").trim());
                    if (quantity > 0) {
                        consumptionMap.put(sessionId, quantity);
                    }
                } catch (NumberFormatException ignored) {}
            }
        }
        System.out.println("   - Consumo mapeado para " + consumptionMap.size() + " sessões.");
        return consumptionMap;
    }

    private List<ConsolidatedRecord> readEventDataAndJoin(String filePath, Map<String, Double> consumptionMap) throws IOException {
        List<ConsolidatedRecord> consolidatedList = new ArrayList<>();

        // try (Reader reader = new FileReader(filePath);//le da raiz o outro le da resources
        try (Reader in = new FileReader(new ClassPathResource(filePath).getFile())) {

            // Colunas do Eventos: sessionId, shipName, class, startGMTDate, duration, aftDraft, etc.
            Iterable<CSVRecord> records = CSVFormat.DEFAULT
                    .builder()
                    .setSkipHeaderRecord(true)
                    .setHeader("sessionId", "shipName", "class", "eventName", "startGMTDate", "endGMTDate", "duration", "distance", "aftDraft", "fwdDraft", "midDraft", "TRIM", "displacement", "beaufortScale", "seaCondition", "beaufortScaleDesc", "seaConditionDesc", "speed", "speedGps", "Porto", "decLatitude", "decLongitude")
                    .build()
                    .parse(in);

            for (CSVRecord record : records) {
                String sessionId = record.get("sessionId");

                if (consumptionMap.containsKey(sessionId)) {
                    try {
                        double speed = Double.parseDouble(record.get("speed").trim());
                        double aftDraft = Double.parseDouble(record.get("aftDraft").trim());
                        double fwdDraft = Double.parseDouble(record.get("fwdDraft").trim());
                        double displacement = Double.parseDouble(record.get("displacement").trim());
                        double duration = Double.parseDouble(record.get("duration").trim());
                        int beaufortScale = Integer.parseInt(record.get("beaufortScale").trim());

                        ConsolidatedRecord rec = new ConsolidatedRecord(
                            sessionId, normalizeShipId(record.get("shipName")), record.get("class"), record.get("eventName"), record.get("startGMTDate"),
                            consumptionMap.get(sessionId), duration, speed, aftDraft, fwdDraft, displacement, beaufortScale
                        );

                        // Filtro: Consumo é relevante apenas para sessões de navegação
                        if (rec.getSpeed() > 1.0 && rec.getDuration() > 1.0) {
                            consolidatedList.add(rec);
                        }

                    } catch (NumberFormatException | NullPointerException ignored) {
                        // Ignora registros com dados numéricos inválidos ou nulos
                    }
                }
            }
        }
        return consolidatedList;
    }

    // --- MÉTODOS DE ENGENHARIA E TREINAMENTO ---

    /**
     * ETAPA 2: Calcula HPI, Dias Desde Limpeza e Features de controle.
     * @param lastCleaningMap
     */
    private List<TrainingDataRecord> featureEngineering(List<ConsolidatedRecord> rawData, Map<String,LocalDate> lastCleaningMap) {

        List<TrainingDataRecord> trainingData = new ArrayList<>();

        for (ConsolidatedRecord rec : rawData) {

            // 1. CALCULAR DIAS DESDE LIMPEZA (X1)
            LocalDate eventDate = parseDate(rec.getStartGMTDate());
            LocalDate lastCleaningDate = lastCleaningMap.get(normalizeShipId(rec.getShipName()));

            if (lastCleaningDate == null || eventDate == null || eventDate.isBefore(lastCleaningDate)) {
                continue;
            }

            long daysSinceCleaning = java.time.temporal.ChronoUnit.DAYS.between(lastCleaningDate, eventDate);
            if (daysSinceCleaning < 1) continue;

            // 2. CALCULAR HPI (Y) - Simplificado: Consumo Diário / Consumo Base
            // Consumo Diário: Assumindo que duration está em HORAS.
            double dailyConsumption = rec.getConsumedQuantity() / (rec.getDuration() / 24.0);

            // Consumo de Referência: Usar o CFI Limpo ESPECÍFICO do navio.
            double cfiCleanSpec = getCfiCleanTonPerDay(normalizeShipId(rec.getShipName()));

            // HPI é a razão entre o consumo real e o consumo de referência para uma condição limpa.
            // Se o CFI específico não for encontrado, getCfiCleanTonPerDay retorna a média da frota (FALLBACK_CFI)
            double hpiCalculated = dailyConsumption / cfiCleanSpec;

            if (hpiCalculated < 1.0) hpiCalculated = 1.0; // Garante HPI mínimo de 1.0

            // 3. POPULAR O TRAINING DATA RECORD
            TrainingDataRecord tdr = new TrainingDataRecord();
            tdr.setHpi(hpiCalculated);
            tdr.setDiasDesdeLimpeza((double) daysSinceCleaning);

            // Features de Controle (X2, X3)
            tdr.setTrimAjustado(rec.getAftDraft() - rec.getFwdDraft()); // TRIM
            tdr.setDeslocamento(rec.getDisplacement());
            // tdr.setBeaufortScaleNumeric(rec.getBeaufortScale()); // X4, se quiser adicionar

            // Adicionar features Dummy para classes de navio se necessário
            // tdr.setClasseAframaxDummy(rec.getClassType().equals("Aframax") ? 1 : 0);

            trainingData.add(tdr);
        }

        return trainingData;
    }

    /**
     * Método auxiliar para parsing de String para LocalDate (formato yyyy-MM-dd HH:mm:ss)
     */
    private LocalDate parseDate(String dateString) {
        try {
            // Pega apenas a parte da data (os primeiros 10 caracteres)
            return LocalDate.parse(dateString.substring(0, 10));
        } catch (Exception e) {
            return null;
        }
    }


    /**
     * ETAPA 3: Prepara os arrays e treina o modelo.
     */
    private void trainModel(List<TrainingDataRecord> trainingData) {
        // Seus 3 preditores são: Dias Desde Limpeza, TRIM Ajustado e Deslocamento
        final int NUM_FEATURES = 3;

        if (trainingData.size() < NUM_FEATURES + 2) {
            System.err.println("   - Dados insuficientes para treinamento. Mínimo: " + (NUM_FEATURES + 2) + " registros.");
            this.trainedModel = null;
            return;
        }

        // Y (Variável Dependente): HPI
        double[] y = trainingData.stream().mapToDouble(TrainingDataRecord::getHpi).toArray();

        // X (Variáveis Independentes/Features)
        double[][] x = new double[trainingData.size()][NUM_FEATURES];

        for (int i = 0; i < trainingData.size(); i++) {
            TrainingDataRecord tdr = trainingData.get(i);
            x[i][0] = tdr.getDiasDesdeLimpeza();
            x[i][1] = tdr.getTrimAjustado();
            x[i][2] = tdr.getDeslocamento();
        }

        try {
            this.trainedModel = new OLSMultipleLinearRegression();
            this.trainedModel.newSampleData(y, x);

            double[] coefficients = this.trainedModel.estimateRegressionParameters();

            System.out.println("   - Coeficientes (Inclui Intercepto + " + NUM_FEATURES + " Features):");
            System.out.println("     Intercepto: " + String.format("%.4f", coefficients[0]));
            System.out.println("     Dias Limpeza: " + String.format("%.6f", coefficients[1]));
            System.out.println("     TRIM: " + String.format("%.4f", coefficients[2]));
            System.out.println("     Deslocamento: " + String.format("%.6f", coefficients[3]));

        } catch (Exception e) {
            System.err.println("   - Erro fatal durante o cálculo da Regressão: " + e.getMessage());
            this.trainedModel = null;
        }
    }

    /**
     * Calcula o Consumo de Combustível Ideal (CFI_Limpo) de cada navio.
     * O CFI é a média do consumo diário nos dias 3 a 7 após a docagem (onde HPI ~ 1.0).
     */
    private void calculateCfiClean(List<ConsolidatedRecord> rawData, Map<String, LocalDate> lastDockingMap) {

        // 1. Agrupa o Consumo Diário por Navio e pelo número de Dias Pós-Limpeza
        Map<String, List<Double>> shipConsumptionPostClean = new HashMap<>();

        for (ConsolidatedRecord rec : rawData) {

            LocalDate eventDate = parseDate(rec.getStartGMTDate());
            LocalDate lastCleaningDate = lastDockingMap.get(normalizeShipId(rec.getShipName()));

            if (lastCleaningDate == null || eventDate == null || eventDate.isBefore(lastCleaningDate)) {
                continue;
            }

            long daysPostCleaning = java.time.temporal.ChronoUnit.DAYS.between(lastCleaningDate, eventDate);

            // Filtra apenas os registros na janela "casco limpo" (Dias 3 a 7)
            if (daysPostCleaning >= DAYS_POST_CLEANING_START && daysPostCleaning <= DAYS_POST_CLEANING_END) {

                // Consumo Diário Real (Ton/Dia)
                double dailyConsumption = rec.getConsumedQuantity() / (rec.getDuration() / 24.0);

                // Armazena o consumo por navio
                shipConsumptionPostClean
                    .computeIfAbsent(normalizeShipId(rec.getShipName()), k -> new ArrayList<>())
                    .add(dailyConsumption);
            }
        }

        // 2. Calcula a média (CFI_Limpo) para cada navio
        for (Map.Entry<String, List<Double>> entry : shipConsumptionPostClean.entrySet()) {
            String shipName = normalizeShipId(entry.getKey());
            List<Double> consumptions = entry.getValue();

            if (!consumptions.isEmpty()) {
                double avgCfi = consumptions.stream().mapToDouble(Double::doubleValue).average().getAsDouble();
                cfiCleanMap.put(shipName, avgCfi);
            }
        }

        System.out.println("   - CFI_Limpo calculado para " + cfiCleanMap.size() + " navios (usando dias " + DAYS_POST_CLEANING_START + "-" + DAYS_POST_CLEANING_END + ").");
    }

    public String normalizeShipId(String shipId) {
        if (shipId == null || shipId.isEmpty()) {
            return "";
        }

        // 1. Normaliza para o formato NFD (Canonical Decomposition)
        String normalized = Normalizer.normalize(shipId.trim().toUpperCase(), Normalizer.Form.NFD);

        // 2. Remove todos os caracteres diacríticos (acentos, cedilha, til)
        // O regex \\p{InCombiningDiacriticalMarks}+ remove todos os caracteres de marcação combinada.
        normalized = normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");

        // 3. Opcional: Remove caracteres que não sejam letras, números ou espaços (se necessário)
        // Se o nome puder conter traços ou pontos, ajuste este regex.
        // Para simplificação, focaremos apenas em letras e números.
        // Exemplo: Substituir outros caracteres não essenciais por espaço ou remover
        // normalized = normalized.replaceAll("[^A-Z0-9 ]", "");

        // 4. Substitui espaços múltiplos por um único espaço
        normalized = normalized.replaceAll("\\s+", " ").trim();

        return normalized;
    }

    public LocalDate getLastCleaningDate(String shipName) {
        // Normaliza o nome do navio para MAIÚSCULAS antes da busca
        String normalizedName = normalizeShipId(shipName);

        // Retorna a data do mapa de docagem
        return lastDockingMap.get(normalizedName);
    }

    /**
     * Retorna o Consumo de Combustível Ideal (CFI_Limpo) específico do navio.
     * Se não encontrado no mapa, retorna o FALLBACK_CFI.
     */
    public double getCfiCleanTonPerDay(String shipName) {
        String normalizedName = normalizeShipId(shipName);

        // Retorna o valor específico ou o FALLBACK, se não houver dados limpos
        return cfiCleanMap.getOrDefault(normalizedName, FALLBACK_CFI);
    }

    public int getPeriodoBaseRevestimento(String navioId) {
        RevestimentoDetail detail = revestimentosMap.get(navioId.trim());
        if (detail != null) {
            return detail.getPeriodoBaseVerificacao();
        }
        return 52;// media
    }

    /**
     * Método que substitui o FALLBACK e busca o TIPO de CARGA/CLASSE do navio.
     * ESSENCIAL para determinarHPILimite no PredictionService.
     */
    public String getShipClassType(String navioId) {
        String normalizedName = navioId.trim().toUpperCase();
        ShipDetail detail = shipDetailsMap.get(normalizedName);

        // Retorna a Classe (Suezmax, Aframax, etc.) ou um fallback para a lógica HPI
        return (detail != null) ? detail.getShipClass() : "UNKNOWN";
    }

}