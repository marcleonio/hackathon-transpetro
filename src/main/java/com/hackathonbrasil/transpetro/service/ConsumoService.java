package com.hackathonbrasil.transpetro.service;

import com.hackathonbrasil.transpetro.model.Consumo;
import com.hackathonbrasil.transpetro.model.ConsumoRequestDto;
import com.hackathonbrasil.transpetro.model.ConsumoResponseDto;
import com.hackathonbrasil.transpetro.model.EventoNavegacao;
import com.hackathonbrasil.transpetro.model.Navio;
import com.hackathonbrasil.transpetro.repository.ConsumoRepository;
import com.hackathonbrasil.transpetro.repository.EventoNavegacaoRepository;
import com.hackathonbrasil.transpetro.repository.NavioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ConsumoService {

    @Autowired
    private ConsumoRepository consumoRepository;

    @Autowired
    private NavioRepository navioRepository;

    @Autowired
    private EventoNavegacaoRepository eventoRepository;

    private ConsumoResponseDto toResponseDto(Consumo consumo) {
        ConsumoResponseDto dto = new ConsumoResponseDto();
        dto.setId(consumo.getId());
        dto.setNavioId(consumo.getNavio().getId());
        dto.setNavioNome(consumo.getNavio().getNome());
        dto.setEventoId(consumo.getEvento() != null ? consumo.getEvento().getId() : null);
        dto.setSessionId(consumo.getSessionId());
        dto.setConsumedQuantity(consumo.getConsumedQuantity());
        dto.setDescription(consumo.getDescription());
        dto.setCreatedAt(consumo.getCreatedAt());
        dto.setUpdatedAt(consumo.getUpdatedAt());
        return dto;
    }

    @Transactional
    public ConsumoResponseDto criar(ConsumoRequestDto dto) {
        if (dto.getNavioId() == null) {
            throw new IllegalArgumentException("Navio ID é obrigatório");
        }
        Navio navio = navioRepository.findById(dto.getNavioId())
            .orElseThrow(() -> new IllegalArgumentException("Navio não encontrado"));

        Consumo consumo = new Consumo();
        consumo.setNavio(navio);
        consumo.setSessionId(dto.getSessionId());
        consumo.setConsumedQuantity(dto.getConsumedQuantity());
        consumo.setDescription(dto.getDescription());

        if (dto.getEventoId() != null) {
            EventoNavegacao evento = eventoRepository.findById(dto.getEventoId())
                .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado"));
            consumo.setEvento(evento);
        }

        consumo = consumoRepository.save(consumo);
        return toResponseDto(consumo);
    }

    @Transactional
    public ConsumoResponseDto atualizar(Long id, ConsumoRequestDto dto) {
        Consumo consumo = consumoRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Consumo não encontrado"));

        if (dto.getNavioId() != null) {
            Navio navio = navioRepository.findById(dto.getNavioId())
                .orElseThrow(() -> new IllegalArgumentException("Navio não encontrado"));
            consumo.setNavio(navio);
        }
        if (dto.getEventoId() != null) {
            EventoNavegacao evento = eventoRepository.findById(dto.getEventoId())
                .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado"));
            consumo.setEvento(evento);
        }
        if (dto.getSessionId() != null) consumo.setSessionId(dto.getSessionId());
        if (dto.getConsumedQuantity() != null) consumo.setConsumedQuantity(dto.getConsumedQuantity());
        if (dto.getDescription() != null) consumo.setDescription(dto.getDescription());

        consumo = consumoRepository.save(consumo);
        return toResponseDto(consumo);
    }

    public ConsumoResponseDto buscarPorId(Long id) {
        Consumo consumo = consumoRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Consumo não encontrado"));
        return toResponseDto(consumo);
    }

    public List<ConsumoResponseDto> listarTodos() {
        return consumoRepository.findAll().stream()
            .map(this::toResponseDto)
            .collect(Collectors.toList());
    }

    public List<ConsumoResponseDto> listarPorNavio(Long navioId) {
        return consumoRepository.findByNavioIdOrderByCreatedAtDesc(navioId).stream()
            .map(this::toResponseDto)
            .collect(Collectors.toList());
    }

    @Transactional
    public void deletar(Long id) {
        if (!consumoRepository.existsById(id)) {
            throw new IllegalArgumentException("Consumo não encontrado");
        }
        consumoRepository.deleteById(id);
    }
}

