package com.hackathonbrasil.transpetro.service;

import com.hackathonbrasil.transpetro.model.Navio;
import com.hackathonbrasil.transpetro.model.NavioRequestDto;
import com.hackathonbrasil.transpetro.model.NavioResponseDto;
import com.hackathonbrasil.transpetro.repository.NavioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NavioService {

    @Autowired
    private NavioRepository navioRepository;

    private NavioResponseDto toResponseDto(Navio navio) {
        NavioResponseDto dto = new NavioResponseDto();
        dto.setId(navio.getId());
        dto.setNome(navio.getNome());
        dto.setClasse(navio.getClasse());
        dto.setTipo(navio.getTipo());
        dto.setPorteBruto(navio.getPorteBruto());
        dto.setComprimentoTotal(navio.getComprimentoTotal());
        dto.setBoca(navio.getBoca());
        dto.setCalado(navio.getCalado());
        dto.setPontal(navio.getPontal());
        dto.setCreatedAt(navio.getCreatedAt());
        dto.setUpdatedAt(navio.getUpdatedAt());
        return dto;
    }

    private Navio toEntity(NavioRequestDto dto) {
        Navio navio = new Navio();
        navio.setNome(dto.getNome());
        navio.setClasse(dto.getClasse());
        navio.setTipo(dto.getTipo());
        navio.setPorteBruto(dto.getPorteBruto());
        navio.setComprimentoTotal(dto.getComprimentoTotal());
        navio.setBoca(dto.getBoca());
        navio.setCalado(dto.getCalado());
        navio.setPontal(dto.getPontal());
        return navio;
    }

    @Transactional
    public NavioResponseDto criar(NavioRequestDto dto) {
        if (dto.getNome() == null || dto.getNome().trim().isEmpty()) {
            throw new IllegalArgumentException("Nome do navio é obrigatório");
        }
        if (navioRepository.existsByNome(dto.getNome().trim())) {
            throw new IllegalArgumentException("Navio com nome '" + dto.getNome() + "' já existe");
        }
        Navio navio = toEntity(dto);
        navio = navioRepository.save(navio);
        return toResponseDto(navio);
    }

    @Transactional
    public NavioResponseDto atualizar(Long id, NavioRequestDto dto) {
        Navio navio = navioRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Navio não encontrado com ID: " + id));
        
        if (dto.getNome() != null && !dto.getNome().trim().isEmpty()) {
            // Verificar se outro navio já tem esse nome
            navioRepository.findByNome(dto.getNome().trim())
                .ifPresent(n -> {
                    if (!n.getId().equals(id)) {
                        throw new IllegalArgumentException("Navio com nome '" + dto.getNome() + "' já existe");
                    }
                });
            navio.setNome(dto.getNome().trim());
        }
        if (dto.getClasse() != null) navio.setClasse(dto.getClasse());
        if (dto.getTipo() != null) navio.setTipo(dto.getTipo());
        if (dto.getPorteBruto() != null) navio.setPorteBruto(dto.getPorteBruto());
        if (dto.getComprimentoTotal() != null) navio.setComprimentoTotal(dto.getComprimentoTotal());
        if (dto.getBoca() != null) navio.setBoca(dto.getBoca());
        if (dto.getCalado() != null) navio.setCalado(dto.getCalado());
        if (dto.getPontal() != null) navio.setPontal(dto.getPontal());
        
        navio = navioRepository.save(navio);
        return toResponseDto(navio);
    }

    public NavioResponseDto buscarPorId(Long id) {
        Navio navio = navioRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Navio não encontrado com ID: " + id));
        return toResponseDto(navio);
    }

    public NavioResponseDto buscarPorNome(String nome) {
        Navio navio = navioRepository.findByNome(nome)
            .orElseThrow(() -> new IllegalArgumentException("Navio não encontrado com nome: " + nome));
        return toResponseDto(navio);
    }

    public List<NavioResponseDto> listarTodos() {
        return navioRepository.findAll().stream()
            .map(this::toResponseDto)
            .collect(Collectors.toList());
    }

    @Transactional
    public void deletar(Long id) {
        if (!navioRepository.existsById(id)) {
            throw new IllegalArgumentException("Navio não encontrado com ID: " + id);
        }
        navioRepository.deleteById(id);
    }
}

