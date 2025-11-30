package com.hackathonbrasil.transpetro.service;

import com.hackathonbrasil.transpetro.model.EventoNavegacao;
import com.hackathonbrasil.transpetro.model.EventoNavegacaoRequestDto;
import com.hackathonbrasil.transpetro.model.EventoNavegacaoResponseDto;
import com.hackathonbrasil.transpetro.model.Navio;
import com.hackathonbrasil.transpetro.repository.EventoNavegacaoRepository;
import com.hackathonbrasil.transpetro.repository.NavioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EventoNavegacaoService {

    @Autowired
    private EventoNavegacaoRepository eventoRepository;

    @Autowired
    private NavioRepository navioRepository;

    private EventoNavegacaoResponseDto toResponseDto(EventoNavegacao evento) {
        EventoNavegacaoResponseDto dto = new EventoNavegacaoResponseDto();
        dto.setId(evento.getId());
        dto.setNavioId(evento.getNavio().getId());
        dto.setNavioNome(evento.getNavio().getNome());
        dto.setSessionId(evento.getSessionId());
        dto.setEventName(evento.getEventName());
        dto.setStartGMTDate(evento.getStartGMTDate());
        dto.setEndGMTDate(evento.getEndGMTDate());
        dto.setDuration(evento.getDuration());
        dto.setDistance(evento.getDistance());
        dto.setAftDraft(evento.getAftDraft());
        dto.setFwdDraft(evento.getFwdDraft());
        dto.setMidDraft(evento.getMidDraft());
        dto.setTrim(evento.getTrim());
        dto.setDisplacement(evento.getDisplacement());
        dto.setBeaufortScale(evento.getBeaufortScale());
        dto.setSeaCondition(evento.getSeaCondition());
        dto.setSpeed(evento.getSpeed());
        dto.setSpeedGps(evento.getSpeedGps());
        dto.setPorto(evento.getPorto());
        dto.setDecLatitude(evento.getDecLatitude());
        dto.setDecLongitude(evento.getDecLongitude());
        dto.setCreatedAt(evento.getCreatedAt());
        dto.setUpdatedAt(evento.getUpdatedAt());
        return dto;
    }

    @Transactional
    public EventoNavegacaoResponseDto criar(EventoNavegacaoRequestDto dto) {
        if (dto.getNavioId() == null) {
            throw new IllegalArgumentException("Navio ID é obrigatório");
        }
        Navio navio = navioRepository.findById(dto.getNavioId())
            .orElseThrow(() -> new IllegalArgumentException("Navio não encontrado"));

        if (dto.getSessionId() != null && eventoRepository.findFirstBySessionId(dto.getSessionId()).isPresent()) {
            throw new IllegalArgumentException("SessionId já existe: " + dto.getSessionId());
        }

        EventoNavegacao evento = new EventoNavegacao();
        evento.setNavio(navio);
        evento.setSessionId(dto.getSessionId());
        evento.setEventName(dto.getEventName());
        evento.setStartGMTDate(dto.getStartGMTDate());
        evento.setEndGMTDate(dto.getEndGMTDate());
        evento.setDuration(dto.getDuration());
        evento.setDistance(dto.getDistance());
        evento.setAftDraft(dto.getAftDraft());
        evento.setFwdDraft(dto.getFwdDraft());
        evento.setMidDraft(dto.getMidDraft());
        evento.setTrim(dto.getTrim());
        evento.setDisplacement(dto.getDisplacement());
        evento.setBeaufortScale(dto.getBeaufortScale());
        evento.setSeaCondition(dto.getSeaCondition());
        evento.setSpeed(dto.getSpeed());
        evento.setSpeedGps(dto.getSpeedGps());
        evento.setPorto(dto.getPorto());
        evento.setDecLatitude(dto.getDecLatitude());
        evento.setDecLongitude(dto.getDecLongitude());

        evento = eventoRepository.save(evento);
        return toResponseDto(evento);
    }

    @Transactional
    public EventoNavegacaoResponseDto atualizar(Long id, EventoNavegacaoRequestDto dto) {
        EventoNavegacao evento = eventoRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado"));

        if (dto.getNavioId() != null) {
            Navio navio = navioRepository.findById(dto.getNavioId())
                .orElseThrow(() -> new IllegalArgumentException("Navio não encontrado"));
            evento.setNavio(navio);
        }
        if (dto.getSessionId() != null) evento.setSessionId(dto.getSessionId());
        if (dto.getEventName() != null) evento.setEventName(dto.getEventName());
        if (dto.getStartGMTDate() != null) evento.setStartGMTDate(dto.getStartGMTDate());
        if (dto.getEndGMTDate() != null) evento.setEndGMTDate(dto.getEndGMTDate());
        if (dto.getDuration() != null) evento.setDuration(dto.getDuration());
        if (dto.getDistance() != null) evento.setDistance(dto.getDistance());
        if (dto.getAftDraft() != null) evento.setAftDraft(dto.getAftDraft());
        if (dto.getFwdDraft() != null) evento.setFwdDraft(dto.getFwdDraft());
        if (dto.getMidDraft() != null) evento.setMidDraft(dto.getMidDraft());
        if (dto.getTrim() != null) evento.setTrim(dto.getTrim());
        if (dto.getDisplacement() != null) evento.setDisplacement(dto.getDisplacement());
        if (dto.getBeaufortScale() != null) evento.setBeaufortScale(dto.getBeaufortScale());
        if (dto.getSeaCondition() != null) evento.setSeaCondition(dto.getSeaCondition());
        if (dto.getSpeed() != null) evento.setSpeed(dto.getSpeed());
        if (dto.getSpeedGps() != null) evento.setSpeedGps(dto.getSpeedGps());
        if (dto.getPorto() != null) evento.setPorto(dto.getPorto());
        if (dto.getDecLatitude() != null) evento.setDecLatitude(dto.getDecLatitude());
        if (dto.getDecLongitude() != null) evento.setDecLongitude(dto.getDecLongitude());

        evento = eventoRepository.save(evento);
        return toResponseDto(evento);
    }

    public EventoNavegacaoResponseDto buscarPorId(Long id) {
        EventoNavegacao evento = eventoRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado"));
        return toResponseDto(evento);
    }

    public List<EventoNavegacaoResponseDto> listarTodos() {
        return eventoRepository.findAll().stream()
            .map(this::toResponseDto)
            .collect(Collectors.toList());
    }

    public List<EventoNavegacaoResponseDto> listarPorNavio(Long navioId) {
        return eventoRepository.findByNavioIdOrderByStartGMTDateDesc(navioId).stream()
            .map(this::toResponseDto)
            .collect(Collectors.toList());
    }

    public List<EventoNavegacaoResponseDto> listarPorPeriodo(Long navioId, LocalDateTime start, LocalDateTime end) {
        return eventoRepository.findByNavioIdAndPeriod(navioId, start, end).stream()
            .map(this::toResponseDto)
            .collect(Collectors.toList());
    }

    @Transactional
    public void deletar(Long id) {
        if (!eventoRepository.existsById(id)) {
            throw new IllegalArgumentException("Evento não encontrado");
        }
        eventoRepository.deleteById(id);
    }
}

