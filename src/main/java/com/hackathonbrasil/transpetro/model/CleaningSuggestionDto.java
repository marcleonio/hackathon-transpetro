package com.hackathonbrasil.transpetro.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO de resposta final contendo a sugestão de limpeza e os dados
 * para visualização da degradação.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CleaningSuggestionDto {

    // --- Identificação e Decisão Principal ---
    private String navioId;

    /**
     * Data da última limpeza do casco, usada como ponto de partida (t=0) para a projeção.
     */
    private LocalDate dataUltimaLimpeza; // <--- NOVO CAMPO AQUI

    /**
     * Data ideal para limpeza (primeiro dia onde HPI >= 1.08).
     * Pode ser null se o limite não for atingido em 180 dias.
     */
    private LocalDate dataIdealLimpeza;

    private long diasParaIntervencao;

    private String justificativa;

    // --- Classificação da Bioincrustação no Último Dia Projetado ---

    /**
     * Status amigável para dashboard (Ex: "🔴 CRÍTICO", "🟢 LIMPO").
     */
    private String statusCascoAtual;

    /**
     * Nível numérico de bioincrustação (0 a 4), ideal para filtros e lógica do Front-end.
     */
    private int nivelBioincrustacao;

    // --- Dados para o Gráfico de Tendência ---

    private double cfiCleanTonPerDay; // Consumo ideal em Toneladas/Dia (ex: 50.0)
    private double maxExtraFuelTonPerDay; // O máximo de combustível extra diário desperdiçado na projeção

    /**
     * Lista completa das previsões diárias (Data e HPI) para o horizonte de 180 dias.
     */
    private List<DailyPredictionDto> predictions;

}