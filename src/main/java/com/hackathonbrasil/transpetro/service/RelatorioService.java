package com.hackathonbrasil.transpetro.service;

import com.hackathonbrasil.transpetro.model.Relatorio;
import com.hackathonbrasil.transpetro.model.dto.RelatorioRequestDto;
import com.hackathonbrasil.transpetro.model.dto.RelatorioResponseDto;
import com.hackathonbrasil.transpetro.repository.RelatorioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RelatorioService {

    @Autowired
    private RelatorioRepository relatorioRepository;

    private static final List<String> TIPOS_VALIDOS = List.of("INSPECAO", "LIMPEZA", "OBSERVACAO", "CONSUMO");
    private static final List<String> STATUS_VALIDOS = List.of("RASCUNHO", "FINALIZADO", "ARQUIVADO");

    private RelatorioResponseDto toDto(Relatorio relatorio) {
        RelatorioResponseDto dto = new RelatorioResponseDto();
        dto.setId(relatorio.getId());
        dto.setNavioId(relatorio.getNavioId());
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

        if (relatorio.getAnexos() != null && !relatorio.getAnexos().isEmpty()) {
            dto.setAnexos(List.of(relatorio.getAnexos().split(",")));
        }

        return dto;
    }

    private Relatorio toEntity(RelatorioRequestDto dto, String registradoPor) {
        Relatorio relatorio = new Relatorio();
        relatorio.setNavioId(dto.getNavioId());
        relatorio.setTipoRelatorio(dto.getTipoRelatorio());
        relatorio.setRegistradoPor(registradoPor);
        relatorio.setTitulo(dto.getTitulo());
        relatorio.setDescricao(dto.getDescricao());
        relatorio.setLocalizacao(dto.getLocalizacao());
        relatorio.setNivelBioincrustacao(dto.getNivelBioincrustacao());
        relatorio.setConsumoObservado(dto.getConsumoObservado());
        relatorio.setTipoLimpeza(dto.getTipoLimpeza());
        relatorio.setDataLimpeza(dto.getDataLimpeza());
        relatorio.setStatus(dto.getStatus() != null ? dto.getStatus() : "RASCUNHO");
        relatorio.setCoordenadas(dto.getCoordenadas());
        relatorio.setObservacoesAdicionais(dto.getObservacoesAdicionais());

        if (dto.getAnexos() != null && !dto.getAnexos().isEmpty()) {
            relatorio.setAnexos(String.join(",", dto.getAnexos()));
        }

        return relatorio;
    }

    private void validateRequest(RelatorioRequestDto dto) {
        if (dto.getNavioId() == null || dto.getNavioId().trim().isEmpty()) {
            throw new IllegalArgumentException("Navio ID é obrigatório");
        }
        if (dto.getTipoRelatorio() == null || !TIPOS_VALIDOS.contains(dto.getTipoRelatorio())) {
            throw new IllegalArgumentException("Tipo de relatório inválido. Deve ser: INSPECAO, LIMPEZA, OBSERVACAO ou CONSUMO");
        }
        if (dto.getTitulo() == null || dto.getTitulo().trim().isEmpty()) {
            throw new IllegalArgumentException("Título é obrigatório");
        }
        if (dto.getStatus() != null && !STATUS_VALIDOS.contains(dto.getStatus())) {
            throw new IllegalArgumentException("Status inválido. Deve ser: RASCUNHO, FINALIZADO ou ARQUIVADO");
        }
        if (dto.getNivelBioincrustacao() != null && 
            (dto.getNivelBioincrustacao() < 0 || dto.getNivelBioincrustacao() > 4)) {
            throw new IllegalArgumentException("Nível de bioincrustação deve estar entre 0 e 4");
        }
    }

    @Transactional
    public RelatorioResponseDto create(RelatorioRequestDto dto, String registradoPor) {
        validateRequest(dto);
        Relatorio relatorio = toEntity(dto, registradoPor);
        relatorio = relatorioRepository.save(relatorio);
        return toDto(relatorio);
    }

    @Transactional(readOnly = true)
    public RelatorioResponseDto findById(Long id) {
        return relatorioRepository.findById(id)
            .map(this::toDto)
            .orElseThrow(() -> new IllegalArgumentException("Relatório não encontrado com ID: " + id));
    }

    @Transactional(readOnly = true)
    public List<RelatorioResponseDto> findAll() {
        return relatorioRepository.findAll().stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RelatorioResponseDto> findByNavioId(String navioId) {
        return relatorioRepository.findByNavioIdOrderByDataRegistroDesc(navioId).stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RelatorioResponseDto> findByTipo(String tipoRelatorio) {
        return relatorioRepository.findByTipoRelatorioOrderByDataRegistroDesc(tipoRelatorio).stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RelatorioResponseDto> findByStatus(String status) {
        return relatorioRepository.findByStatusOrderByDataRegistroDesc(status).stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RelatorioResponseDto> findByNivelBioincrustacao(Integer nivel) {
        return relatorioRepository.findByNivelBioincrustacaoOrderByDataRegistroDesc(nivel).stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RelatorioResponseDto> findByDataRange(LocalDateTime dataInicio, LocalDateTime dataFim) {
        return relatorioRepository.findByDataRegistroBetween(dataInicio, dataFim).stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RelatorioResponseDto> findWithFilters(
        String navioId,
        String tipoRelatorio,
        String status,
        Integer nivelBioincrustacao
    ) {
        return relatorioRepository.findWithFilters(navioId, tipoRelatorio, status, nivelBioincrustacao).stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RelatorioResponseDto> searchByText(String busca) {
        if (busca == null || busca.trim().isEmpty()) {
            return findAll();
        }
        return relatorioRepository.searchByText(busca.trim()).stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Transactional
    public RelatorioResponseDto update(Long id, RelatorioRequestDto dto) {
        validateRequest(dto);
        Relatorio relatorio = relatorioRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Relatório não encontrado com ID: " + id));

        relatorio.setNavioId(dto.getNavioId());
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

        if (dto.getAnexos() != null) {
            relatorio.setAnexos(dto.getAnexos().isEmpty() ? null : String.join(",", dto.getAnexos()));
        }

        relatorio = relatorioRepository.save(relatorio);
        return toDto(relatorio);
    }

    @Transactional
    public void delete(Long id) {
        if (!relatorioRepository.existsById(id)) {
            throw new IllegalArgumentException("Relatório não encontrado com ID: " + id);
        }
        relatorioRepository.deleteById(id);
    }
}

