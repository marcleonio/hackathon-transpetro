package com.hackathonbrasil.transpetro.service;

import com.hackathonbrasil.transpetro.model.CleaningSuggestionDto;
import com.hackathonbrasil.transpetro.model.DailyPredictionDto;
import org.apache.commons.math3.stat.regression.OLSMultipleLinearRegression;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class PredictionService {

    @Autowired
    private ModelService modelService;

    // --- CONSTANTES DE DECISÃO HPI ---
    private static final double HPI_LIMITE_DECISAO = 1.08;
    //dias para gerar e analisar o HPI e o Consumo Extra para os próximos 180 dias (cerca de 6 meses), impede que a degradação para um futuro muito distante
    private static final int MAX_PROJECTION_DAYS = 180;

    private static final double HPI_THRESHOLD = 1.025;
    private static final double HPI_LEVEL_4_START = 1.08; // > 8% de perda
    private static final double HPI_LEVEL_3_START = 1.06; // > 6% de perda
    private static final double HPI_LEVEL_2_START = HPI_THRESHOLD; // 1.025, o gatilho real de limpeza
    private static final double DEFAULT_DEGRADATION_RATE = 0.0005;
    private static final double HPI_ACCEPTABLE_MAX_CLEAN = 1.030; // 3% de perda é o máximo aceitável para um casco "limpo" (Ponto de corte entre Nível 1 e 2)

    private double[] adjustCoefficients(double[] rawCoefficients) {
        if (rawCoefficients.length < 4) {
            // Lógica de fallback mantida (se o array for muito curto)
            return rawCoefficients;
        }

        double[] adjusted = Arrays.copyOf(rawCoefficients, rawCoefficients.length);

        // --- 1. AJUSTE DO COEFICIENTE DE DIAS (Taxa de Degradação) ---
        double betaDays = rawCoefficients[1];
        if (betaDays <= 0 || betaDays > 0.005) { // Evita taxas negativas ou irrealisticamente altas (ex: 0.5% por dia)
            System.out.println("⚠️ WARNING: Coeficiente de Dias Limpeza inválido/não razoável. Usando taxa padrão.");
            adjusted[1] = DEFAULT_DEGRADATION_RATE;
        }

        // --- 2. AJUSTE DO INTERCEPTO (HPI Inicial - Ponto de Partida) ---
        double intercept = rawCoefficients[0];

        if (intercept < 1.00) {
            // O HPI não pode ser menor que 1.00 (Eficiência 100%)
            System.out.println("⚠️ WARNING: Intercepto abaixo de 1.0. Corrigindo para 1.0.");
            adjusted[0] = 1.0;
        } else if (intercept > HPI_ACCEPTABLE_MAX_CLEAN) {
            // Se o intercepto for muito alto, forçamos para o limite superior aceitável.
            // Isso simula que o navio foi "limpo" na melhor condição possível.
            System.out.println("⚠️ WARNING: Intercepto muito alto. Corrigindo para o limite máximo aceitável (" + HPI_ACCEPTABLE_MAX_CLEAN + ").");
            adjusted[0] = HPI_ACCEPTABLE_MAX_CLEAN;
        }

        return adjusted;
    }

    private int getNivelBioincrustacao(double hpi) {
        // Nível 4 (Ação mais urgente)
        if (hpi >= HPI_LEVEL_4_START) {
            return 4;
        // Nível 3 (Ação urgente)
        } else if (hpi >= HPI_LEVEL_3_START) {
            return 3;
        // Nível 2 (Início da Limpeza Reativa, usando o HPI_THRESHOLD real)
        } else if (hpi >= HPI_LEVEL_2_START) {
            return 2;
        // Nível 1 (Microencrustação)
        } else if (hpi > 1.00) {
            return 1;
        // Nível 0 (Limpo)
        } else {
            return 0;
        }
    }

    private String getStatusDescricao(int nivel) {
        switch (nivel) {
            case 0: return "🟢 LIMPO (Sem bioincrustação)";
            case 1: return "🟡 ATENÇÃO (Microencrustação)";
            case 2: return "🟠 ALERTA (Macroincrustação leve)";
            case 3: return "🔴 CRÍTICO (Macroincrustação moderada)";
            case 4: return "🚨 URGENTE (Macroincrustação pesada)";
            default: return "STATUS DESCONHECIDO";
        }
    }

    /**
     * Mapeia o HPI projetado para a Porcentagem de Cobertura da Superfície
     * (Estimated Incrustation Coverage), seguindo as RNs de Nível de Bioincrustação.
     * * NOTA: Os limites de HPI são ESTIMATIVAS de correlação entre perda de performance (HPI)
     * e a cobertura física.
     * @param hpi O HPI (Hull Performance Index) calculado.
     * @return A porcentagem de cobertura da superfície correspondente ao Nível de Bioincrustação.
     */
    private double getEstimatedIncrustationCoverage(double hpi) {
        if (hpi <= 1.025) {
            // Nível 0 (0% Cobertura) ou Nível 1 (Microincrustação - Cobertura muito baixa).
            // Usamos 1.0% como um valor de representação Proativa/Baixa.
            return 1.0;
        } else if (hpi <= 1.050) {
            // Nível 2: Macroincrustação leve (1-15% Cobertura).
            // Atribuímos o LIMITE MÁXIMO da faixa (15%) para indicar a pior condição do nível.
            return 15.0;
        } else if (hpi <= 1.100) {
            // Nível 3: Macroincrustação moderada (16-40% Cobertura).
            // Atribuímos o LIMITE MÁXIMO da faixa (40%).
            return 40.0;
        } else {
            // Nível 4: Macroincrustação pesada (41-100% Cobertura).
            // Atribuímos 100% como a condição mais crítica.
            return 100.0;
        }
    }

    /**
     * Realiza uma interpolação linear para mapear um valor (HPI) de uma faixa
     * para outra faixa (Porcentagem de Cobertura).
     */
    private double linearMap(double value, double inMin, double inMax, double outMin, double outMax) {
        if (inMax == inMin) return outMin;
        double normalized = (value - inMin) / (inMax - inMin);
        return outMin + normalized * (outMax - outMin);
    }

    /**
     * Faz a estimativa da Porcentagem de Cobertura da Superfície de forma contínua e arredondada.
     * @param hpi O HPI calculado.
     * @return Porcentagem de Cobertura Estimada (0.00 a 100.00).
     */
    private double getEstimatedIncrustationCoverageGranular(double hpi) {
        double coverage;

        if (hpi <= 1.025) {
            // Nível 0/1: [0.0%, 1.0%]
            coverage = linearMap(hpi, 1.000, 1.025, 0.0, 1.0);

        } else if (hpi <= 1.050) {
            // Nível 2: [1.0%, 15.0%]
            coverage = linearMap(hpi, 1.025, 1.050, 1.0, 15.0);

        } else if (hpi <= 1.100) {
            // Nível 3: [15.0%, 40.0%]
            coverage = linearMap(hpi, 1.050, 1.100, 15.0, 40.0);

        } else {
            // Nível 4: [40.0%, 100.0%]
            double maxHpi = 1.200;
            coverage = linearMap(hpi, 1.100, maxHpi, 40.0, 100.0);
            coverage = Math.min(coverage, 100.0);
        }

        // ARREDONDAMENTO PARA DUAS CASAS DECIMAIS
        // Multiplica por 100, arredonda, e divide por 100 novamente.
        return Math.round(coverage * 100.0) / 100.0;
    }

    // --- MÉTODO PRINCIPAL DE PREVISÃO ---

    public CleaningSuggestionDto suggestCleaningDate(String navioId) {
        navioId = modelService.normalizeShipId(navioId); // Garante que o navioId esteja em maiúsculas

        double cfiCleanTonPerDay = modelService.getCfiCleanTonPerDay(navioId);
        LocalDate ultimaLimpeza = modelService.getLastCleaningDate(navioId);

        if (ultimaLimpeza == null) {
            return buildFallbackDto(navioId, "Data da última docagem não encontrada para o navio.", 1.0, new ArrayList<>(), cfiCleanTonPerDay);
        }

        OLSMultipleLinearRegression model = modelService.getTrainedModel();
        if (model == null) {
            return buildFallbackDto(navioId, "Modelo de ML não treinado ou indisponível.", 1.0, new ArrayList<>(), cfiCleanTonPerDay);
        }

        // --- 1. CONFIGURAÇÃO DO GATILHO DINÂMICO ---
        String tipoCarga = modelService.getShipClassType(navioId);
        if (tipoCarga == null || tipoCarga.isEmpty()) {
            tipoCarga = "UNKNOWN";
        }

        // Calcula o LIMITE DINÂMICO UMA ÚNICA VEZ antes de começar a projeção
        final double HPI_THRESHOLD_DINAMICO = determinarHPILimite(navioId, tipoCarga);
        System.out.println("✅ HPI Limite Dinâmico para " + navioId + ": " + String.format("%.3f", HPI_THRESHOLD_DINAMICO));

        // --- 2. PREPARAÇÃO DA PREDIÇÃO ---
        double[] rawCoefficients = model.estimateRegressionParameters();

        // Lógica de tratamento/ajuste de coeficientes (sua lógica mantida)
        if (rawCoefficients.length < 4) {
            double coefDiasFallback = rawCoefficients.length > 1 ? rawCoefficients[1] : DEFAULT_DEGRADATION_RATE;
            double coefAjustado = coefDiasFallback > 0 ? coefDiasFallback : DEFAULT_DEGRADATION_RATE;
            System.out.println("❌ ERRO: Modelo treinado com número insuficiente de coeficientes (" + rawCoefficients.length + "). Usando Fallback.");
            rawCoefficients = new double[] {rawCoefficients[0], coefAjustado, 0.0, 0.0};
        }
        double[] coefficients = adjustCoefficients(rawCoefficients);

        double intercept = coefficients[0];
        double betaDays = coefficients[1];
        // Variáveis de controle de regressão são consideradas zero na projeção futura
        double betaTrim = coefficients[2];
        double betaDeslocamento = coefficients[3];
        double trimFuture = 0.0;
        double deslocamentoFuture = 0.0;

        LocalDate dataHoje = LocalDate.now();
        long daysSinceLastCleaning = ChronoUnit.DAYS.between(ultimaLimpeza, dataHoje);

        // HPI no dia de HOJE (Ponto inicial):
        double initialHPI = intercept
                        + (betaDays * daysSinceLastCleaning)
                        + (betaTrim * trimFuture)
                        + (betaDeslocamento * deslocamentoFuture);

        double predictedHPI = Math.max(1.0, initialHPI);

        // --- 3. PONTO INICIAL (HOJE) ---
        DailyPredictionDto initialPrediction = new DailyPredictionDto(dataHoje, predictedHPI,0d,0d,getEstimatedIncrustationCoverageGranular(predictedHPI));
        calculatePerformanceMetrics(initialPrediction, cfiCleanTonPerDay);

        List<DailyPredictionDto> predictions = new ArrayList<>();
        predictions.add(initialPrediction);
        double maxExtraFuel = initialPrediction.getExtraFuelTonPerDay();
        LocalDate dataIdeal = null; // Data do gatilho

        // --- 4. Simulação e Projeção Diária (Começa a partir de amanhã) ---
        long maxDays = daysSinceLastCleaning + MAX_PROJECTION_DAYS;

        for (long days = daysSinceLastCleaning + 1; days < maxDays; days++) {
            LocalDate predictionDate = ultimaLimpeza.plusDays(days);

            // PREVISÃO DO HPI
            double calculatedHPI = intercept
                                 + (betaDays * days)
                                 + (betaTrim * trimFuture)        // betaTrim * 0.0
                                 + (betaDeslocamento * deslocamentoFuture);
            predictedHPI = Math.max(1.0, calculatedHPI);

            DailyPredictionDto prediction = new DailyPredictionDto(predictionDate, predictedHPI,0d,0d,getEstimatedIncrustationCoverageGranular(predictedHPI));
            calculatePerformanceMetrics(prediction, cfiCleanTonPerDay);

            predictions.add(prediction);

            if (prediction.getExtraFuelTonPerDay() > maxExtraFuel) {
                maxExtraFuel = prediction.getExtraFuelTonPerDay();
            }

            // --- VERIFICAÇÃO DO LIMITE DINÂMICO (Gatilho de Limpeza) ---
            if (predictedHPI >= HPI_THRESHOLD_DINAMICO) {
                dataIdeal = predictionDate;
                // break; // Atingiu o limite, para a projeção
            }
        }

        // --- 5. Montagem do DTO Final ---
        int nivelAtual = getNivelBioincrustacao(initialHPI);
        String statusDescricaoAtual = getStatusDescricao(nivelAtual);

        String justificativaFinal;
        if (dataIdeal != null) {
            justificativaFinal = "Data de limpeza sugerida: HPI projetado atingiu o limite de performance dinâmico ("
                            + String.format("%.3f", HPI_THRESHOLD_DINAMICO) + ") em " + dataIdeal + ".";
        } else {
            justificativaFinal = "HPI projetado (" + String.format("%.3f", predictedHPI) + ") não atingiu o limite ("
                            + String.format("%.3f", HPI_THRESHOLD_DINAMICO) + ") dentro de " + MAX_PROJECTION_DAYS + " dias.";
        }

        return new CleaningSuggestionDto(
            navioId,
            ultimaLimpeza,
            dataIdeal,
            dataIdeal != null ? ChronoUnit.DAYS.between(ultimaLimpeza, dataIdeal) : 0L, // Calcula os dias se houver data
            justificativaFinal,
            statusDescricaoAtual,
            nivelAtual,
            cfiCleanTonPerDay,
            maxExtraFuel,
            predictions
        );
    }

    // --- Método Auxiliar para Falhas ---
    private CleaningSuggestionDto buildFallbackDto(String navioId, String motivo, double hpi, List<DailyPredictionDto> predictions, double cfiCleanTonPerDay) {
        int nivel = getNivelBioincrustacao(hpi);
        return new CleaningSuggestionDto(
            navioId,
            null,
            null,
            0l,
            motivo,
            getStatusDescricao(nivel),
            nivel,
            cfiCleanTonPerDay,
            0.0,
            predictions
        );
    }

    /**
     * Calcula as métricas de performance (Arrasto Relativo e Consumo Extra)
     * para uma previsão diária específica.
     */
    private void calculatePerformanceMetrics(DailyPredictionDto prediction, double cfiCleanTonPerDay) {
        double hpi = prediction.getHpi();

        // 1. Arrasto Relativo (Relative Drag)
        double dragPercent = (hpi - 1.0) * 100.0;
        prediction.setDragPercent(Math.max(0.0, dragPercent));

        // 2. Consumo Diário Extra de Combustível (Daily Extra Fuel)
        double extraFuelTonPerDay = cfiCleanTonPerDay * (hpi - 1.0);
        prediction.setExtraFuelTonPerDay(Math.max(0.0, extraFuelTonPerDay));
    }

    public double determinarHPILimite(String navioId, String tipoCarga) {
        double hpiBase;

        // 1. DEFINE O HPI BASE PELA CLASSE (Derivado do Porte Bruto)
        if (tipoCarga.contains("Suezmax")) {
            hpiBase = 1.030;
        } else if (tipoCarga.contains("Aframax")) {
            hpiBase = 1.025;
        } else if (tipoCarga.contains("Product carrier")) {
            hpiBase = 1.020;
        } else if (tipoCarga.contains("Gaseiro")) {
            hpiBase = 1.028;
        } else {
            hpiBase = 1.0275; // Valor de fallback HPI_THRESHOLD
        }

        // 2. BUSCA O PERÍODO BASE DO REVESTIMENTO (Dado do CSV)
        int periodoBase = modelService.getPeriodoBaseRevestimento(navioId);

        // 3. APLICA AJUSTE FINO COM BASE NA QUALIDADE DO REVESTIMENTO
        if (periodoBase <= 35) { // Curto Período Base (Revestimento Padrão)
            // Reduz a tolerância (HPI Limite fica mais rigoroso)
            return hpiBase - 0.005;
        } else if (periodoBase >= 120) { // Longo Período Base (Revestimento Premium)
            // Aumenta a tolerância (HPI Limite fica mais alto)
            return hpiBase + 0.005;
        } else {
            // Usa o HPI Base da Classe
            return hpiBase;
        }
    }
}