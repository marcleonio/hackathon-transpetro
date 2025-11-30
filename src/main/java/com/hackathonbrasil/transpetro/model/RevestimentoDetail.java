package com.hackathonbrasil.transpetro.model;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RevestimentoDetail {
    private String navioId; // Sigla/ID do Navio
    private int periodoBaseVerificacao; // Cr1. Período base de verificação
    private LocalDate dataAplicacao;

}
