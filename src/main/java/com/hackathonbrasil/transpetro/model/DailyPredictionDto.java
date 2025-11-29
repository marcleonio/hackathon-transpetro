package com.hackathonbrasil.transpetro.model;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DailyPredictionDto {

    // A data específica da previsão
    private LocalDate data;

    // O HPI projetado para essa data
    private double hpi;

    /**
     * Aumento percentual do arrasto/consumo em relação ao casco limpo. 
     * Fórmula: (HPI - 1.0) * 100
     */
    private double dragPercent; // Ex: 18.12
    
    /**
     * Consumo extra diário em Toneladas (economia potencial). 
     * Fórmula: cfiCleanTonPerDay * (hpi - 1.0)
     */
    private double extraFuelTonPerDay; // Ex: 9.06

    // ... getters e setters ...
}
