package com.hackathonbrasil.transpetro.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventoNavegacaoRequestDto {
    private Long navioId;
    private String sessionId;
    private String eventName;
    private LocalDateTime startGMTDate;
    private LocalDateTime endGMTDate;
    private Double duration;
    private Double distance;
    private Double aftDraft;
    private Double fwdDraft;
    private Double midDraft;
    private Double trim;
    private Double displacement;
    private Integer beaufortScale;
    private String seaCondition;
    private Double speed;
    private Double speedGps;
    private String porto;
    private Double decLatitude;
    private Double decLongitude;
}

