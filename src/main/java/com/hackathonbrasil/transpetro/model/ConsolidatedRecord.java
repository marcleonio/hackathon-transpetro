package com.hackathonbrasil.transpetro.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ConsolidatedRecord {
    private String sessionId;
    private String shipName;
    private String classType; // Classe do Navio
    private String eventName;
    private String startGMTDate; // Para calcular Dias Desde Limpeza
    private double consumedQuantity; // Consumo
    private double duration; // Adicionado para cálculo do consumo/dia
    private double speed;
    private double aftDraft;
    private double fwdDraft;
    private double displacement;
    private int beaufortScale; // Condição do mar

    // Construtor, Getters e Setters gerados pelo Lombok
}
