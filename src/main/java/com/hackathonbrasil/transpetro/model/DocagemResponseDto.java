package com.hackathonbrasil.transpetro.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocagemResponseDto {
    private Long id;
    private Long navioId;
    private String navioNome;
    private LocalDate dataDocagem;
    private String tipo;
    private String observacoes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

