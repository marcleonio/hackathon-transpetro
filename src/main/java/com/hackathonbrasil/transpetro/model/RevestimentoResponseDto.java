package com.hackathonbrasil.transpetro.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RevestimentoResponseDto {
    private Long id;
    private Long navioId;
    private String navioNome;
    private String sigla;
    private LocalDate dataAplicacao;
    private Integer periodoBaseVerificacao;
    private Integer paradaMaximaAcumulada;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

