package com.hackathonbrasil.transpetro.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocagemRequestDto {
    private Long navioId;
    private LocalDate dataDocagem;
    private String tipo;
    private String observacoes;
}

