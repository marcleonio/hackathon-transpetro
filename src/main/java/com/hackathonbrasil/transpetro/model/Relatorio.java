package com.hackathonbrasil.transpetro.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "relatorios")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Relatorio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String navioId;

    @Column(nullable = false, length = 50)
    private String tipoRelatorio;

    @Column(nullable = false)
    private LocalDateTime dataRegistro;

    @Column(nullable = false, length = 100)
    private String registradoPor;

    @Column(nullable = false, length = 200)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(length = 100)
    private String localizacao;

    @Column
    private Integer nivelBioincrustacao;

    @Column
    private Double consumoObservado;

    @Column(length = 50)
    private String tipoLimpeza;

    @Column
    private LocalDate dataLimpeza;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(columnDefinition = "TEXT")
    private String anexos;

    @Column(length = 100)
    private String coordenadas;

    @Column(columnDefinition = "TEXT")
    private String observacoesAdicionais;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (dataRegistro == null) {
            dataRegistro = LocalDateTime.now();
        }
        if (status == null || status.isEmpty()) {
            status = "RASCUNHO";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

