package com.hackathonbrasil.transpetro.service;

import com.hackathonbrasil.transpetro.model.Navio;
import com.hackathonbrasil.transpetro.model.Relatorio;
import com.hackathonbrasil.transpetro.model.RelatorioRequestDto;
import com.hackathonbrasil.transpetro.model.RelatorioResponseDto;
import com.hackathonbrasil.transpetro.repository.NavioRepository;
import com.hackathonbrasil.transpetro.repository.RelatorioRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RelatorioService {

    @Autowired
    private RelatorioRepository relatorioRepository;

    @Autowired
    private NavioRepository navioRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // Tipos de relatório válidos
    private static final List<String> TIPOS_VALIDOS = List.of("INSPECAO", "LIMPEZA", "OBSERVACAO", "CONSUMO");
    
    // Status válidos
    private static final List<String> STATUS_VALIDOS = List.of("RASCUNHO", "FINALIZADO", "ARQUIVADO");

    /**
     * Converte Relatorio para RelatorioResponseDto
     */
    private RelatorioResponseDto toResponseDto(Relatorio relatorio) {
        RelatorioResponseDto dto = new RelatorioResponseDto();
        dto.setId(relatorio.getId());
        // Usar relacionamento se disponível, senão usar navioId string
        if (relatorio.getNavio() != null) {
            dto.setNavioId(relatorio.getNavio().getNome());
        } else {
            dto.setNavioId(relatorio.getNavioId());
        }
        dto.setTipoRelatorio(relatorio.getTipoRelatorio());
        dto.setDataRegistro(relatorio.getDataRegistro());
        dto.setRegistradoPor(relatorio.getRegistradoPor());
        dto.setTitulo(relatorio.getTitulo());
        dto.setDescricao(relatorio.getDescricao());
        dto.setLocalizacao(relatorio.getLocalizacao());
        dto.setNivelBioincrustacao(relatorio.getNivelBioincrustacao());
        dto.setConsumoObservado(relatorio.getConsumoObservado());
        dto.setTipoLimpeza(relatorio.getTipoLimpeza());
        dto.setDataLimpeza(relatorio.getDataLimpeza());
        dto.setStatus(relatorio.getStatus());
        dto.setCoordenadas(relatorio.getCoordenadas());
        dto.setObservacoesAdicionais(relatorio.getObservacoesAdicionais());
        dto.setCreatedAt(relatorio.getCreatedAt());
        dto.setUpdatedAt(relatorio.getUpdatedAt());

        // Converter anexos de String JSON para List<String>
        if (relatorio.getAnexos() != null && !relatorio.getAnexos().isEmpty()) {
            try {
                List<String> anexosList = objectMapper.readValue(relatorio.getAnexos(), 
                    new TypeReference<List<String>>() {});
                dto.setAnexos(anexosList);
            } catch (Exception e) {
                dto.setAnexos(List.of());
            }
        } else {
            dto.setAnexos(List.of());
        }

        return dto;
    }

    /**
     * Converte RelatorioRequestDto para Relatorio
     */
    private Relatorio toEntity(RelatorioRequestDto dto) {
        Relatorio relatorio = new Relatorio();
        
        // Buscar navio pelo nome ou ID
        if (dto.getNavioId() != null && !dto.getNavioId().trim().isEmpty()) {
            String navioNome = dto.getNavioId().trim();
            Optional<Navio> navioOpt = navioRepository.findByNome(navioNome);
            if (navioOpt.isPresent()) {
                Navio navio = navioOpt.get();
                relatorio.setNavio(navio);
                relatorio.setNavioId(navio.getNome());
            } else {
                relatorio.setNavioId(navioNome);
            }
        }
        relatorio.setTipoRelatorio(dto.getTipoRelatorio());
        relatorio.setTitulo(dto.getTitulo());
        relatorio.setDescricao(dto.getDescricao());
        relatorio.setLocalizacao(dto.getLocalizacao());
        relatorio.setNivelBioincrustacao(dto.getNivelBioincrustacao());
        relatorio.setConsumoObservado(dto.getConsumoObservado());
        relatorio.setTipoLimpeza(dto.getTipoLimpeza());
        relatorio.setDataLimpeza(dto.getDataLimpeza());
        relatorio.setCoordenadas(dto.getCoordenadas());
        relatorio.setObservacoesAdicionais(dto.getObservacoesAdicionais());
        relatorio.setRegistradoPor(dto.getRegistradoPor() != null ? dto.getRegistradoPor() : "Sistema");
        
        // Status padrão se não informado
        relatorio.setStatus(dto.getStatus() != null ? dto.getStatus() : "RASCUNHO");
        
        // Data de registro padrão se não informada
        relatorio.setDataRegistro(LocalDateTime.now());

        // Converter anexos de List<String> para String JSON
        if (dto.getAnexos() != null && !dto.getAnexos().isEmpty()) {
            try {
                relatorio.setAnexos(objectMapper.writeValueAsString(dto.getAnexos()));
            } catch (Exception e) {
                relatorio.setAnexos("[]");
            }
        } else {
            relatorio.setAnexos("[]");
        }

        return relatorio;
    }

    /**
     * Valida os dados do relatório
     */
    private void validarRelatorio(RelatorioRequestDto dto) {
        if (dto.getNavioId() == null || dto.getNavioId().trim().isEmpty()) {
            throw new IllegalArgumentException("Navio ID é obrigatório");
        }

        if (dto.getTipoRelatorio() == null || dto.getTipoRelatorio().trim().isEmpty()) {
            throw new IllegalArgumentException("Tipo de relatório é obrigatório");
        }

        if (!TIPOS_VALIDOS.contains(dto.getTipoRelatorio().toUpperCase())) {
            throw new IllegalArgumentException("Tipo de relatório inválido. Valores aceitos: " + TIPOS_VALIDOS);
        }

        if (dto.getTitulo() == null || dto.getTitulo().trim().isEmpty()) {
            throw new IllegalArgumentException("Título é obrigatório");
        }

        if (dto.getStatus() != null && !STATUS_VALIDOS.contains(dto.getStatus().toUpperCase())) {
            throw new IllegalArgumentException("Status inválido. Valores aceitos: " + STATUS_VALIDOS);
        }

        // Validações específicas por tipo
        if ("INSPECAO".equalsIgnoreCase(dto.getTipoRelatorio())) {
            if (dto.getNivelBioincrustacao() != null && 
                (dto.getNivelBioincrustacao() < 0 || dto.getNivelBioincrustacao() > 4)) {
                throw new IllegalArgumentException("Nível de bioincrustação deve estar entre 0 e 4");
            }
        }

        if ("LIMPEZA".equalsIgnoreCase(dto.getTipoRelatorio())) {
            if (dto.getTipoLimpeza() != null && 
                !List.of("Parcial", "Completa", "Em Docagem").contains(dto.getTipoLimpeza())) {
                throw new IllegalArgumentException("Tipo de limpeza inválido. Valores aceitos: Parcial, Completa, Em Docagem");
            }
        }

        if ("CONSUMO".equalsIgnoreCase(dto.getTipoRelatorio())) {
            if (dto.getConsumoObservado() != null && dto.getConsumoObservado() < 0) {
                throw new IllegalArgumentException("Consumo observado não pode ser negativo");
            }
        }
    }

    /**
     * Cria um novo relatório
     */
    @Transactional
    public RelatorioResponseDto criar(RelatorioRequestDto dto) {
        validarRelatorio(dto);
        Relatorio relatorio = toEntity(dto);
        relatorio = relatorioRepository.save(relatorio);
        return toResponseDto(relatorio);
    }

    /**
     * Atualiza um relatório existente
     */
    @Transactional
    public RelatorioResponseDto atualizar(Long id, RelatorioRequestDto dto) {
        Relatorio relatorio = relatorioRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Relatório não encontrado com ID: " + id));

        validarRelatorio(dto);

        // Atualiza os campos
        if (dto.getNavioId() != null && !dto.getNavioId().trim().isEmpty()) {
            String navioNome = dto.getNavioId().trim();
            Optional<Navio> navioOpt = navioRepository.findByNome(navioNome);
            if (navioOpt.isPresent()) {
                Navio navio = navioOpt.get();
                relatorio.setNavio(navio);
                relatorio.setNavioId(navio.getNome());
            } else {
                relatorio.setNavioId(navioNome);
            }
        }
        relatorio.setTipoRelatorio(dto.getTipoRelatorio());
        relatorio.setTitulo(dto.getTitulo());
        relatorio.setDescricao(dto.getDescricao());
        relatorio.setLocalizacao(dto.getLocalizacao());
        relatorio.setNivelBioincrustacao(dto.getNivelBioincrustacao());
        relatorio.setConsumoObservado(dto.getConsumoObservado());
        relatorio.setTipoLimpeza(dto.getTipoLimpeza());
        relatorio.setDataLimpeza(dto.getDataLimpeza());
        relatorio.setStatus(dto.getStatus() != null ? dto.getStatus() : relatorio.getStatus());
        relatorio.setCoordenadas(dto.getCoordenadas());
        relatorio.setObservacoesAdicionais(dto.getObservacoesAdicionais());
        
        if (dto.getRegistradoPor() != null) {
            relatorio.setRegistradoPor(dto.getRegistradoPor());
        }

        // Atualizar anexos
        if (dto.getAnexos() != null) {
            try {
                relatorio.setAnexos(objectMapper.writeValueAsString(dto.getAnexos()));
            } catch (Exception e) {
                relatorio.setAnexos("[]");
            }
        }

        relatorio = relatorioRepository.save(relatorio);
        return toResponseDto(relatorio);
    }

    /**
     * Busca um relatório por ID
     */
    public RelatorioResponseDto buscarPorId(Long id) {
        Relatorio relatorio = relatorioRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Relatório não encontrado com ID: " + id));
        return toResponseDto(relatorio);
    }

    /**
     * Lista todos os relatórios
     */
    public List<RelatorioResponseDto> listarTodos() {
        return relatorioRepository.findAll().stream()
            .map(this::toResponseDto)
            .collect(Collectors.toList());
    }

    /**
     * Lista relatórios por navio
     */
    public List<RelatorioResponseDto> listarPorNavio(String navioId) {
        return relatorioRepository.findByNavioIdOrderByDataRegistroDesc(navioId).stream()
            .map(this::toResponseDto)
            .collect(Collectors.toList());
    }

    /**
     * Lista relatórios por tipo
     */
    public List<RelatorioResponseDto> listarPorTipo(String tipo) {
        return relatorioRepository.findByTipoRelatorioOrderByDataRegistroDesc(tipo).stream()
            .map(this::toResponseDto)
            .collect(Collectors.toList());
    }

    /**
     * Lista relatórios por status
     */
    public List<RelatorioResponseDto> listarPorStatus(String status) {
        return relatorioRepository.findByStatusOrderByDataRegistroDesc(status).stream()
            .map(this::toResponseDto)
            .collect(Collectors.toList());
    }

    /**
     * Lista relatórios por navio e tipo
     */
    public List<RelatorioResponseDto> listarPorNavioETipo(String navioId, String tipo) {
        return relatorioRepository.findByNavioIdAndTipoRelatorioOrderByDataRegistroDesc(navioId, tipo).stream()
            .map(this::toResponseDto)
            .collect(Collectors.toList());
    }

    /**
     * Lista relatórios por nível de bioincrustação
     */
    public List<RelatorioResponseDto> listarPorNivelBioincrustacao(Integer nivel) {
        return relatorioRepository.findByNivelBioincrustacaoOrderByDataRegistroDesc(nivel).stream()
            .map(this::toResponseDto)
            .collect(Collectors.toList());
    }

    /**
     * Lista relatórios por range de datas
     */
    public List<RelatorioResponseDto> listarPorRangeDatas(LocalDateTime dataInicio, LocalDateTime dataFim) {
        return relatorioRepository.findByDataRegistroBetweenOrderByDataRegistroDesc(dataInicio, dataFim).stream()
            .map(this::toResponseDto)
            .collect(Collectors.toList());
    }

    /**
     * Lista relatórios por navio e range de datas
     */
    public List<RelatorioResponseDto> listarPorNavioERangeDatas(String navioId, LocalDateTime dataInicio, LocalDateTime dataFim) {
        return relatorioRepository.findByNavioIdAndDataRegistroBetweenOrderByDataRegistroDesc(navioId, dataInicio, dataFim).stream()
            .map(this::toResponseDto)
            .collect(Collectors.toList());
    }

    /**
     * Busca textual em relatórios
     */
    public List<RelatorioResponseDto> buscarPorTermo(String termo) {
        return relatorioRepository.buscarPorTermo(termo).stream()
            .map(this::toResponseDto)
            .collect(Collectors.toList());
    }

    /**
     * Busca textual em relatórios de um navio específico
     */
    public List<RelatorioResponseDto> buscarPorNavioETermo(String navioId, String termo) {
        return relatorioRepository.buscarPorNavioETermo(navioId, termo).stream()
            .map(this::toResponseDto)
            .collect(Collectors.toList());
    }

    /**
     * Deleta um relatório
     */
    @Transactional
    public void deletar(Long id) {
        if (!relatorioRepository.existsById(id)) {
            throw new IllegalArgumentException("Relatório não encontrado com ID: " + id);
        }
        relatorioRepository.deleteById(id);
    }
}
