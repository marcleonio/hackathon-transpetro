package com.hackathonbrasil.transpetro.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RelatorioResponseDto {

    private Long id;
    private String navioId;
    private String tipoRelatorio;
    private LocalDateTime dataRegistro;
    private String registradoPor;
    private String titulo;
    private String descricao;
    private String localizacao;
    private Integer nivelBioincrustacao;
    private Double consumoObservado;
    private String tipoLimpeza;
    private LocalDate dataLimpeza;
    private String status;
    private List<String> anexos;
    private String coordenadas;
    private String observacoesAdicionais;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

