package com.hackathonbrasil.transpetro.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RevestimentoRequestDto {
    private Long navioId;
    private String sigla;
    private LocalDate dataAplicacao;
    private Integer periodoBaseVerificacao;
    private Integer paradaMaximaAcumulada;
}

