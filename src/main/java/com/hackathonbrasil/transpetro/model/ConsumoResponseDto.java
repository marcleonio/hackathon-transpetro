package com.hackathonbrasil.transpetro.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConsumoResponseDto {
    private Long id;
    private Long navioId;
    private String navioNome;
    private Long eventoId;
    private String sessionId;
    private Double consumedQuantity;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

