package com.hackathonbrasil.transpetro.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NavioRequestDto {
    private String nome;
    private String classe;
    private String tipo;
    private Double porteBruto;
    private Double comprimentoTotal;
    private Double boca;
    private Double calado;
    private Double pontal;
}

