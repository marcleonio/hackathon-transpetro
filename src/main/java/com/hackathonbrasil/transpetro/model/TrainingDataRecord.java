package com.hackathonbrasil.transpetro.model;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TrainingDataRecord {

    // --- VARIÁVEIS DE IDENTIFICAÇÃO E TEMPO (Úteis para debugging) ---
    private String sessionId;
    private String shipName;
    private LocalDate dataRelatorio; // Data usada como referência para o cálculo do HPI

    // --- Y (VARIÁVEL TARGET) ---
    private double hpi;

    // --- X (VARIÁVEIS PREDITORAS) ---

    // X1: Variável de Degradação (Principal)
    private double diasDesdeLimpeza;

    // X2: Variáveis de Condição de Carga (Ajuste de Arrasto)
    private double trimAjustado;
    private double deslocamento;
    private double caladoMedio;

    // X3: Variáveis Ambientais (Ajuste de Consumo Externo)
    private int beaufortScaleNumeric;     // Escala de Força do Vento no mar

    // X4: Variáveis Categóricas (Normalização da Classe do Navio)
    // Usamos variáveis dummy (1 ou 0) para ajustar o intercepto por classe.
    private int classeSuezmaxDummy;
    private int classeAframaxDummy;
    private int classeMR2Dummy;
    // O Gaseiro 7k será a categoria base, implícita quando as outras são 0.

    // Construtor, Getters e Setters (Omitidos aqui por brevidade, mas devem ser incluídos)
    // ...
}
