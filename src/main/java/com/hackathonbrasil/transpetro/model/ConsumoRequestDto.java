package com.hackathonbrasil.transpetro.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConsumoRequestDto {
    private Long navioId;
    private Long eventoId; // Opcional
    private String sessionId;
    private Double consumedQuantity;
    private String description;
}

