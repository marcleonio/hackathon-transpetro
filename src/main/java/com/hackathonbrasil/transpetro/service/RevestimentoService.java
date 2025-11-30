package com.hackathonbrasil.transpetro.service;

import com.hackathonbrasil.transpetro.model.Navio;
import com.hackathonbrasil.transpetro.model.Revestimento;
import com.hackathonbrasil.transpetro.model.RevestimentoRequestDto;
import com.hackathonbrasil.transpetro.model.RevestimentoResponseDto;
import com.hackathonbrasil.transpetro.repository.NavioRepository;
import com.hackathonbrasil.transpetro.repository.RevestimentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RevestimentoService {

    @Autowired
    private RevestimentoRepository revestimentoRepository;

    @Autowired
    private NavioRepository navioRepository;

    private RevestimentoResponseDto toResponseDto(Revestimento revestimento) {
        RevestimentoResponseDto dto = new RevestimentoResponseDto();
        dto.setId(revestimento.getId());
        dto.setNavioId(revestimento.getNavio().getId());
        dto.setNavioNome(revestimento.getNavio().getNome());
        dto.setSigla(revestimento.getSigla());
        dto.setDataAplicacao(revestimento.getDataAplicacao());
        dto.setPeriodoBaseVerificacao(revestimento.getPeriodoBaseVerificacao());
        dto.setParadaMaximaAcumulada(revestimento.getParadaMaximaAcumulada());
        dto.setCreatedAt(revestimento.getCreatedAt());
        dto.setUpdatedAt(revestimento.getUpdatedAt());
        return dto;
    }

    @Transactional
    public RevestimentoResponseDto criar(RevestimentoRequestDto dto) {
        if (dto.getNavioId() == null) {
            throw new IllegalArgumentException("Navio ID é obrigatório");
        }
        Navio navio = navioRepository.findById(dto.getNavioId())
            .orElseThrow(() -> new IllegalArgumentException("Navio não encontrado"));

        Revestimento revestimento = new Revestimento();
        revestimento.setNavio(navio);
        revestimento.setSigla(dto.getSigla());
        revestimento.setDataAplicacao(dto.getDataAplicacao());
        revestimento.setPeriodoBaseVerificacao(dto.getPeriodoBaseVerificacao());
        revestimento.setParadaMaximaAcumulada(dto.getParadaMaximaAcumulada());

        revestimento = revestimentoRepository.save(revestimento);
        return toResponseDto(revestimento);
    }

    @Transactional
    public RevestimentoResponseDto atualizar(Long id, RevestimentoRequestDto dto) {
        Revestimento revestimento = revestimentoRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Revestimento não encontrado"));

        if (dto.getNavioId() != null) {
            Navio navio = navioRepository.findById(dto.getNavioId())
                .orElseThrow(() -> new IllegalArgumentException("Navio não encontrado"));
            revestimento.setNavio(navio);
        }
        if (dto.getSigla() != null) revestimento.setSigla(dto.getSigla());
        if (dto.getDataAplicacao() != null) revestimento.setDataAplicacao(dto.getDataAplicacao());
        if (dto.getPeriodoBaseVerificacao() != null) revestimento.setPeriodoBaseVerificacao(dto.getPeriodoBaseVerificacao());
        if (dto.getParadaMaximaAcumulada() != null) revestimento.setParadaMaximaAcumulada(dto.getParadaMaximaAcumulada());

        revestimento = revestimentoRepository.save(revestimento);
        return toResponseDto(revestimento);
    }

    public RevestimentoResponseDto buscarPorId(Long id) {
        Revestimento revestimento = revestimentoRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Revestimento não encontrado"));
        return toResponseDto(revestimento);
    }

    public List<RevestimentoResponseDto> listarTodos() {
        return revestimentoRepository.findAll().stream()
            .map(this::toResponseDto)
            .collect(Collectors.toList());
    }

    public List<RevestimentoResponseDto> listarPorNavio(Long navioId) {
        return revestimentoRepository.findByNavioIdOrderByDataAplicacaoDesc(navioId).stream()
            .map(this::toResponseDto)
            .collect(Collectors.toList());
    }

    public RevestimentoResponseDto buscarUltimoRevestimentoPorNavio(Long navioId) {
        return revestimentoRepository.findUltimoRevestimentoByNavioId(navioId)
            .map(this::toResponseDto)
            .orElseThrow(() -> new IllegalArgumentException("Nenhum revestimento encontrado para o navio"));
    }

    @Transactional
    public void deletar(Long id) {
        if (!revestimentoRepository.existsById(id)) {
            throw new IllegalArgumentException("Revestimento não encontrado");
        }
        revestimentoRepository.deleteById(id);
    }
}

