package com.hackathonbrasil.transpetro.service;

import com.hackathonbrasil.transpetro.model.*;
import com.hackathonbrasil.transpetro.repository.*;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.text.Normalizer;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class DataImportService {

    @Autowired
    private NavioRepository navioRepository;

    @Autowired
    private DocagemRepository docagemRepository;

    @Autowired
    private EventoNavegacaoRepository eventoRepository;

    @Autowired
    private ConsumoRepository consumoRepository;

    @Autowired
    private RevestimentoRepository revestimentoRepository;

    @Autowired
    private ModelService modelService;

    /**
     * Normaliza o nome do navio para busca (mesma lógica do ModelService)
     */
    private String normalizeShipName(String shipName) {
        if (shipName == null || shipName.isEmpty()) {
            return "";
        }
        String normalized = Normalizer.normalize(shipName.trim().toUpperCase(), Normalizer.Form.NFD);
        normalized = normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        normalized = normalized.replaceAll("\\s+", " ").trim();
        return normalized;
    }

    /**
     * Busca ou cria um navio pelo nome (sem transação para evitar lock)
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW, readOnly = true)
    private Navio findOrCreateNavio(String nomeNavio) {
        String normalizedName = normalizeShipName(nomeNavio);
        Optional<Navio> navioOpt = navioRepository.findByNome(normalizedName);
        
        if (navioOpt.isPresent()) {
            return navioOpt.get();
        }
        
        // Se não encontrado, cria um navio básico em transação separada
        return createNavioIfNotExists(normalizedName);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    private Navio createNavioIfNotExists(String normalizedName) {
        // Verifica novamente para evitar race condition
        Optional<Navio> navioOpt = navioRepository.findByNome(normalizedName);
        if (navioOpt.isPresent()) {
            return navioOpt.get();
        }
        
        Navio navio = new Navio();
        navio.setNome(normalizedName);
        navio.setClasse("UNKNOWN");
        navio.setTipo("UNKNOWN");
        navio.setPorteBruto(0.0);
        return navioRepository.save(navio);
    }

    /**
     * Parse de data no formato M/D/YYYY
     */
    private LocalDate parseDate(String dateString) {
        try {
            String[] parts = dateString.split("/");
            if (parts.length == 3) {
                return LocalDate.of(
                    Integer.parseInt(parts[2].trim()),
                    Integer.parseInt(parts[0].trim()),
                    Integer.parseInt(parts[1].trim())
                );
            }
        } catch (Exception ignored) {}
        return null;
    }

    /**
     * Importa navios do CSV (versão com arquivo do resources)
     */
    public int importNaviosCSV(String filePath) throws IOException {
        return importNaviosCSV(new ClassPathResource(filePath).getInputStream());
    }

    /**
     * Importa navios do CSV enviado via upload (processamento em lotes)
     */
    public int importNaviosCSV(MultipartFile file) throws IOException {
        return importNaviosCSV(file.getInputStream());
    }

    /**
     * Importa navios do CSV a partir de um InputStream (processamento em lotes)
     */
    private int importNaviosCSV(java.io.InputStream inputStream) throws IOException {
        int imported = 0;
        List<Navio> naviosToSave = new ArrayList<>();
        final int BATCH_SIZE = 50;
        
        try (Reader in = new InputStreamReader(inputStream)) {
            Iterable<CSVRecord> records = CSVFormat.DEFAULT
                .builder()
                .setHeader("Nome do navio", "Classe", "Tipo", "Porte Bruto", "Comprimento total (m)", "Boca (m)", "Calado (m)", "Pontal (m)")
                .setSkipHeaderRecord(true)
                .build()
                .parse(in);

            for (CSVRecord record : records) {
                String nomeNavio = normalizeShipName(record.get("Nome do navio"));
                if (nomeNavio.isEmpty()) continue;

                Navio navio = processNavioRecord(record, nomeNavio);
                if (navio != null) {
                    naviosToSave.add(navio);
                    
                    // Salva em lotes para evitar timeout
                    if (naviosToSave.size() >= BATCH_SIZE) {
                        imported += saveNaviosBatch(naviosToSave);
                        naviosToSave.clear();
                    }
                }
            }
            
            // Salva os restantes
            if (!naviosToSave.isEmpty()) {
                imported += saveNaviosBatch(naviosToSave);
            }
        }
        
        return imported;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    private int saveNaviosBatch(List<Navio> navios) {
        int saved = 0;
        for (Navio navio : navios) {
            try {
                Optional<Navio> existing = navioRepository.findByNome(navio.getNome());
                if (existing.isPresent()) {
                    Navio existingNavio = existing.get();
                    existingNavio.setClasse(navio.getClasse());
                    existingNavio.setTipo(navio.getTipo());
                    existingNavio.setPorteBruto(navio.getPorteBruto());
                    existingNavio.setComprimentoTotal(navio.getComprimentoTotal());
                    existingNavio.setBoca(navio.getBoca());
                    existingNavio.setCalado(navio.getCalado());
                    existingNavio.setPontal(navio.getPontal());
                    navioRepository.save(existingNavio);
                } else {
                    navioRepository.save(navio);
                }
                saved++;
            } catch (Exception e) {
                // Ignora erros individuais e continua
                System.err.println("Erro ao salvar navio " + navio.getNome() + ": " + e.getMessage());
            }
        }
        return saved;
    }

    private Navio processNavioRecord(CSVRecord record, String nomeNavio) {
        Navio navio = new Navio();
        navio.setNome(nomeNavio);
        navio.setClasse(record.get("Classe").trim());
        navio.setTipo(record.get("Tipo").trim());
        
        try {
            navio.setPorteBruto(Double.parseDouble(record.get("Porte Bruto").trim()));
            String comprimento = record.get("Comprimento total (m)");
            if (comprimento != null && !comprimento.trim().isEmpty()) {
                navio.setComprimentoTotal(Double.parseDouble(comprimento.trim()));
            }
            String boca = record.get("Boca (m)");
            if (boca != null && !boca.trim().isEmpty()) {
                navio.setBoca(Double.parseDouble(boca.trim()));
            }
            String calado = record.get("Calado (m)");
            if (calado != null && !calado.trim().isEmpty()) {
                navio.setCalado(Double.parseDouble(calado.trim()));
            }
            String pontal = record.get("Pontal (m)");
            if (pontal != null && !pontal.trim().isEmpty()) {
                navio.setPontal(Double.parseDouble(pontal.trim()));
            }
            return navio;
        } catch (NumberFormatException ignored) {
            return null;
        }
    }

    /**
     * Importa docagens do CSV (versão com arquivo do resources)
     */
    public int importDocagemCSV(String filePath) throws IOException {
        return importDocagemCSV(new ClassPathResource(filePath).getInputStream());
    }

    /**
     * Importa docagens do CSV enviado via upload
     */
    public int importDocagemCSV(MultipartFile file) throws IOException {
        return importDocagemCSV(file.getInputStream());
    }

    /**
     * Importa docagens do CSV e associa aos navios (processamento em lotes)
     */
    private int importDocagemCSV(java.io.InputStream inputStream) throws IOException {
        int imported = 0;
        List<Docagem> docagensToSave = new ArrayList<>();
        final int BATCH_SIZE = 100;
        Map<String, Navio> navioCache = new HashMap<>();
        
        try (Reader in = new InputStreamReader(inputStream)) {
            Iterable<CSVRecord> records = CSVFormat.DEFAULT
                .builder()
                .setHeader("Navio", "Docagem", "Tipo")
                .setSkipHeaderRecord(true)
                .build()
                .parse(in);

            for (CSVRecord record : records) {
                String nomeNavio = normalizeShipName(record.get("Navio"));
                String dateString = record.get("Docagem").trim();
                String tipo = record.get("Tipo").trim();

                if (nomeNavio.isEmpty() || dateString.isEmpty()) continue;

                LocalDate dataDocagem = parseDate(dateString);
                if (dataDocagem == null) continue;

                Navio navio = navioCache.computeIfAbsent(nomeNavio, this::findOrCreateNavio);
                
                Docagem docagem = new Docagem();
                docagem.setNavio(navio);
                docagem.setDataDocagem(dataDocagem);
                docagem.setTipo(tipo.isEmpty() ? "Especial" : tipo);
                docagensToSave.add(docagem);
                
                if (docagensToSave.size() >= BATCH_SIZE) {
                    imported += saveDocagensBatch(docagensToSave);
                    docagensToSave.clear();
                }
            }
            
            if (!docagensToSave.isEmpty()) {
                imported += saveDocagensBatch(docagensToSave);
            }
        }
        
        return imported;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    private int saveDocagensBatch(List<Docagem> docagens) {
        try {
            // Usa saveAll() para inserção em batch
            docagemRepository.saveAll(docagens);
            return docagens.size();
        } catch (Exception e) {
            // Se houver erro de constraint, tenta salvar individualmente
            int saved = 0;
            for (Docagem docagem : docagens) {
                try {
                    docagemRepository.save(docagem);
                    saved++;
                } catch (Exception ex) {
                    // Ignora duplicatas e outros erros
                }
            }
            return saved;
        }
    }

    /**
     * Importa eventos de navegação do CSV (versão com arquivo do resources)
     */
    public int importEventosCSV(String filePath) throws IOException {
        return importEventosCSV(new ClassPathResource(filePath).getInputStream());
    }

    /**
     * Importa eventos de navegação do CSV enviado via upload
     */
    public int importEventosCSV(MultipartFile file) throws IOException {
        return importEventosCSV(file.getInputStream());
    }

    /**
     * Importa eventos de navegação do CSV e associa aos navios (processamento em lotes)
     */
    private int importEventosCSV(java.io.InputStream inputStream) throws IOException {
        int imported = 0;
        List<EventoNavegacao> eventosToSave = new ArrayList<>();
        final int BATCH_SIZE = 2000; // Aumentado para processar mais rápido
        Map<String, Navio> navioCache = new HashMap<>();
        Map<String, Boolean> sessionIdCache = new HashMap<>(); // Cache de sessionIds já verificados
        
        try (Reader in = new InputStreamReader(inputStream)) {
            Iterable<CSVRecord> records = CSVFormat.DEFAULT
                .builder()
                .setSkipHeaderRecord(true)
                .setHeader("sessionId", "shipName", "class", "eventName", "startGMTDate", "endGMTDate", 
                          "duration", "distance", "aftDraft", "fwdDraft", "midDraft", "TRIM", 
                          "displacement", "beaufortScale", "seaCondition", "beaufortScaleDesc", 
                          "seaConditionDesc", "speed", "speedGps", "Porto", "decLatitude", "decLongitude")
                .build()
                .parse(in);

            for (CSVRecord record : records) {
                String sessionId = record.get("sessionId");
                String shipName = normalizeShipName(record.get("shipName"));
                
                if (sessionId == null || sessionId.isEmpty() || shipName.isEmpty()) continue;

                // Verifica cache primeiro (muito mais rápido)
                if (sessionIdCache.containsKey(sessionId)) {
                    continue; // Já processado
                }
                sessionIdCache.put(sessionId, true);

                Navio navio = navioCache.computeIfAbsent(shipName, this::findOrCreateNavio);

                EventoNavegacao evento = processEventoRecord(record, navio, sessionId);
                if (evento != null) {
                    eventosToSave.add(evento);
                    
                    if (eventosToSave.size() >= BATCH_SIZE) {
                        imported += saveEventosBatch(eventosToSave);
                        eventosToSave.clear();
                        System.out.println("   Processados " + imported + " eventos...");
                    }
                }
            }
            
            if (!eventosToSave.isEmpty()) {
                imported += saveEventosBatch(eventosToSave);
            }
        }
        
        return imported;
    }

    private EventoNavegacao processEventoRecord(CSVRecord record, Navio navio, String sessionId) {
        EventoNavegacao evento = new EventoNavegacao();
        evento.setNavio(navio);
        evento.setSessionId(sessionId);
        evento.setEventName(record.get("eventName"));

        try {
            String startDateStr = record.get("startGMTDate");
            if (startDateStr != null && !startDateStr.isEmpty()) {
                evento.setStartGMTDate(parseDateTime(startDateStr));
            }
            String endDateStr = record.get("endGMTDate");
            if (endDateStr != null && !endDateStr.isEmpty()) {
                evento.setEndGMTDate(parseDateTime(endDateStr));
            }

            if (record.get("duration") != null && !record.get("duration").trim().isEmpty()) {
                evento.setDuration(Double.parseDouble(record.get("duration").trim()));
            }
            if (record.get("distance") != null && !record.get("distance").trim().isEmpty()) {
                evento.setDistance(Double.parseDouble(record.get("distance").trim()));
            }
            if (record.get("aftDraft") != null && !record.get("aftDraft").trim().isEmpty()) {
                evento.setAftDraft(Double.parseDouble(record.get("aftDraft").trim()));
            }
            if (record.get("fwdDraft") != null && !record.get("fwdDraft").trim().isEmpty()) {
                evento.setFwdDraft(Double.parseDouble(record.get("fwdDraft").trim()));
            }
            if (record.get("midDraft") != null && !record.get("midDraft").trim().isEmpty()) {
                evento.setMidDraft(Double.parseDouble(record.get("midDraft").trim()));
            }
            if (record.get("TRIM") != null && !record.get("TRIM").trim().isEmpty()) {
                evento.setTrim(Double.parseDouble(record.get("TRIM").trim()));
            }
            if (record.get("displacement") != null && !record.get("displacement").trim().isEmpty()) {
                evento.setDisplacement(Double.parseDouble(record.get("displacement").trim()));
            }
            if (record.get("beaufortScale") != null && !record.get("beaufortScale").trim().isEmpty()) {
                evento.setBeaufortScale(Integer.parseInt(record.get("beaufortScale").trim()));
            }
            if (record.get("speed") != null && !record.get("speed").trim().isEmpty()) {
                evento.setSpeed(Double.parseDouble(record.get("speed").trim()));
            }
            if (record.get("speedGps") != null && !record.get("speedGps").trim().isEmpty()) {
                evento.setSpeedGps(Double.parseDouble(record.get("speedGps").trim()));
            }
            if (record.get("decLatitude") != null && !record.get("decLatitude").trim().isEmpty()) {
                evento.setDecLatitude(Double.parseDouble(record.get("decLatitude").trim()));
            }
            if (record.get("decLongitude") != null && !record.get("decLongitude").trim().isEmpty()) {
                evento.setDecLongitude(Double.parseDouble(record.get("decLongitude").trim()));
            }
        } catch (NumberFormatException ignored) {
            return null;
        }

        evento.setSeaCondition(record.get("seaCondition"));
        evento.setPorto(record.get("Porto"));
        return evento;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    private int saveEventosBatch(List<EventoNavegacao> eventos) {
        try {
            // Usa saveAll() para inserção em batch (muito mais rápido)
            eventoRepository.saveAll(eventos);
            return eventos.size();
        } catch (Exception e) {
            // Se houver erro de constraint (duplicata), tenta salvar individualmente
            int saved = 0;
            for (EventoNavegacao evento : eventos) {
                try {
                    eventoRepository.save(evento);
                    saved++;
                } catch (Exception ex) {
                    // Ignora duplicatas e outros erros
                }
            }
            return saved;
        }
    }

    /**
     * Importa consumos do CSV (versão com arquivo do resources)
     */
    public int importConsumosCSV(String filePath) throws IOException {
        return importConsumosCSV(new ClassPathResource(filePath).getInputStream());
    }

    /**
     * Importa consumos do CSV enviado via upload
     */
    public int importConsumosCSV(MultipartFile file) throws IOException {
        return importConsumosCSV(file.getInputStream());
    }

    /**
     * Importa consumos do CSV e associa aos navios (processamento em lotes)
     */
    private int importConsumosCSV(java.io.InputStream inputStream) throws IOException {
        int imported = 0;
        List<Consumo> consumosToSave = new ArrayList<>();
        final int BATCH_SIZE = 2000; // Aumentado para processar mais rápido
        Map<String, EventoNavegacao> eventoCache = new HashMap<>(); // Cache de eventos
        
        try (Reader in = new InputStreamReader(inputStream)) {
            Iterable<CSVRecord> records = CSVFormat.DEFAULT
                .builder()
                .setHeader("SESSION_ID", "CONSUMED_QUANTITY", "DESCRIPTION")
                .setSkipHeaderRecord(true)
                .build()
                .parse(in);

            // Pré-carrega eventos em cache (uma única query)
            System.out.println("   Carregando eventos em cache...");
            List<EventoNavegacao> todosEventos = eventoRepository.findAll();
            for (EventoNavegacao evento : todosEventos) {
                eventoCache.put(evento.getSessionId(), evento);
            }
            System.out.println("   " + eventoCache.size() + " eventos carregados em cache");

            for (CSVRecord record : records) {
                String sessionId = record.get("SESSION_ID");
                String description = record.get("DESCRIPTION");

                if (sessionId == null || sessionId.isEmpty()) continue;

                try {
                    double consumedQuantity = Double.parseDouble(record.get("CONSUMED_QUANTITY").trim());
                    if (consumedQuantity <= 0) continue;

                    // Busca no cache (muito mais rápido que query no banco)
                    EventoNavegacao evento = eventoCache.get(sessionId);
                    
                    if (evento != null) {
                        Navio navio = evento.getNavio();

                        Consumo consumo = new Consumo();
                        consumo.setNavio(navio);
                        consumo.setEvento(evento);
                        consumo.setSessionId(sessionId);
                        consumo.setConsumedQuantity(consumedQuantity);
                        consumo.setDescription(description != null ? description : "");

                        consumosToSave.add(consumo);
                        
                        if (consumosToSave.size() >= BATCH_SIZE) {
                            imported += saveConsumosBatch(consumosToSave);
                            consumosToSave.clear();
                            System.out.println("   Processados " + imported + " consumos...");
                        }
                    }
                } catch (NumberFormatException ignored) {
                    continue;
                }
            }
            
            if (!consumosToSave.isEmpty()) {
                imported += saveConsumosBatch(consumosToSave);
            }
        }
        
        return imported;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    private int saveConsumosBatch(List<Consumo> consumos) {
        try {
            // Usa saveAll() para inserção em batch (muito mais rápido)
            consumoRepository.saveAll(consumos);
            return consumos.size();
        } catch (Exception e) {
            // Se houver erro, tenta salvar individualmente
            int saved = 0;
            for (Consumo consumo : consumos) {
                try {
                    consumoRepository.save(consumo);
                    saved++;
                } catch (Exception ex) {
                    // Ignora erros individuais
                }
            }
            return saved;
        }
    }

    /**
     * Importa revestimentos do CSV (versão com arquivo do resources)
     */
    public int importRevestimentosCSV(String filePath) throws IOException {
        return importRevestimentosCSV(new ClassPathResource(filePath).getInputStream());
    }

    /**
     * Importa revestimentos do CSV enviado via upload
     */
    public int importRevestimentosCSV(MultipartFile file) throws IOException {
        return importRevestimentosCSV(file.getInputStream());
    }

    /**
     * Importa revestimentos do CSV e associa aos navios (processamento em lotes)
     */
    private int importRevestimentosCSV(java.io.InputStream inputStream) throws IOException {
        int imported = 0;
        List<Revestimento> revestimentosToSave = new ArrayList<>();
        final int BATCH_SIZE = 50;
        Map<String, Navio> navioCache = new HashMap<>();
        
        try (Reader in = new InputStreamReader(inputStream)) {
            Iterable<CSVRecord> records = CSVFormat.DEFAULT
                .builder()
                .setHeader("Sigla", "Nome do navio", "TipoClass", "TipoCarga", "ClasseNum", 
                          "Data da aplicacao", "Cr1. Período base de verificação", 
                          "Cr1. Parada máxima acumulada no período")
                .setSkipHeaderRecord(true)
                .build()
                .parse(in);

            for (CSVRecord record : records) {
                String nomeNavio = normalizeShipName(record.get("Nome do navio"));
                String dateString = record.get("Data da aplicacao").trim();
                String periodoStr = record.get("Cr1. Período base de verificação").trim();
                String paradaStr = record.get("Cr1. Parada máxima acumulada no período").trim();

                if (nomeNavio.isEmpty() || dateString.isEmpty()) continue;

                LocalDate dataAplicacao = parseDate(dateString);
                if (dataAplicacao == null) continue;

                Navio navio = navioCache.computeIfAbsent(nomeNavio, this::findOrCreateNavio);

                try {
                    int periodoBase = Integer.parseInt(periodoStr);
                    int paradaMaxima = Integer.parseInt(paradaStr);

                    Revestimento revestimento = new Revestimento();
                    revestimento.setNavio(navio);
                    revestimento.setSigla(record.get("Sigla"));
                    revestimento.setDataAplicacao(dataAplicacao);
                    revestimento.setPeriodoBaseVerificacao(periodoBase);
                    revestimento.setParadaMaximaAcumulada(paradaMaxima);

                    revestimentosToSave.add(revestimento);
                    
                    if (revestimentosToSave.size() >= BATCH_SIZE) {
                        imported += saveRevestimentosBatch(revestimentosToSave);
                        revestimentosToSave.clear();
                    }
                } catch (NumberFormatException ignored) {
                    continue;
                }
            }
            
            if (!revestimentosToSave.isEmpty()) {
                imported += saveRevestimentosBatch(revestimentosToSave);
            }
        }
        
        return imported;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    private int saveRevestimentosBatch(List<Revestimento> revestimentos) {
        try {
            // Usa saveAll() para inserção em batch
            revestimentoRepository.saveAll(revestimentos);
            return revestimentos.size();
        } catch (Exception e) {
            // Se houver erro, tenta salvar individualmente
            int saved = 0;
            for (Revestimento revestimento : revestimentos) {
                try {
                    revestimentoRepository.save(revestimento);
                    saved++;
                } catch (Exception ex) {
                    // Ignora erros individuais
                }
            }
            return saved;
        }
    }

    /**
     * Parse de DateTime no formato yyyy-MM-dd HH:mm:ss
     */
    private LocalDateTime parseDateTime(String dateTimeString) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            return LocalDateTime.parse(dateTimeString, formatter);
        } catch (Exception e) {
            try {
                // Tenta apenas a data
                return LocalDate.parse(dateTimeString.substring(0, 10)).atStartOfDay();
            } catch (Exception ignored) {
                return null;
            }
        }
    }

    /**
     * Importa todos os CSVs padrão do projeto
     */
    @Transactional
    public void importAllDefaultCSVs() throws IOException {
        System.out.println("--- INICIANDO IMPORTAÇÃO DE CSVs ---");
        
        int navios = importNaviosCSV("dados_navio.csv");
        System.out.println("✅ Navios importados: " + navios);
        
        int docagens = importDocagemCSV("dados_docagem.csv");
        System.out.println("✅ Docagens importadas: " + docagens);
        
        int eventos = importEventosCSV("ResultadoQueryEventos.csv");
        System.out.println("✅ Eventos importados: " + eventos);
        
        int consumos = importConsumosCSV("ResultadoQueryConsumo.csv");
        System.out.println("✅ Consumos importados: " + consumos);
        
        int revestimentos = importRevestimentosCSV("revestimento.csv");
        System.out.println("✅ Revestimentos importados: " + revestimentos);
        
        System.out.println("--- IMPORTAÇÃO CONCLUÍDA ---");
    }
}


