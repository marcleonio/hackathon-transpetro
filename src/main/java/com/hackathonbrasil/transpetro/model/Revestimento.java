package com.hackathonbrasil.transpetro.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "revestimentos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Revestimento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "navio_id", nullable = false)
    private Navio navio;

    @Column(length = 10)
    private String sigla;

    @Column(nullable = false, name = "data_aplicacao")
    private LocalDate dataAplicacao;

    @Column(nullable = false, name = "periodo_base_verificacao")
    private Integer periodoBaseVerificacao;

    @Column(nullable = false, name = "parada_maxima_acumulada")
    private Integer paradaMaximaAcumulada;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

