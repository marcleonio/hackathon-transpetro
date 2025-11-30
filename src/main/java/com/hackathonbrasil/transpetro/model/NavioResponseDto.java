package com.hackathonbrasil.transpetro.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NavioResponseDto {
    private Long id;
    private String nome;
    private String classe;
    private String tipo;
    private Double porteBruto;
    private Double comprimentoTotal;
    private Double boca;
    private Double calado;
    private Double pontal;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

