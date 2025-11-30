package com.hackathonbrasil.transpetro.model;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ShipDetail {
    private String shipName;
    private String shipClass; // Ex: Suezmax, Aframax
    private String cargoType; // Ex: Petroleiro, Gaseiro
    private double deadweightTonnage; // Porte Bruto
}
