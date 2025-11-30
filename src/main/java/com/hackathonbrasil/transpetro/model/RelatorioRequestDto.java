package com.hackathonbrasil.transpetro.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RelatorioRequestDto {

    private String navioId;
    private String tipoRelatorio;        // INSPECAO, LIMPEZA, OBSERVACAO, CONSUMO
    private String titulo;
    private String descricao;
    private String localizacao;
    private Integer nivelBioincrustacao;  // 0-4
    private Double consumoObservado;
    private String tipoLimpeza;           // "Parcial", "Completa", "Em Docagem"
    private LocalDate dataLimpeza;
    private String status;                // "RASCUNHO", "FINALIZADO", "ARQUIVADO"
    private List<String> anexos;
    private String coordenadas;
    private String observacoesAdicionais;
    private String registradoPor;
}

