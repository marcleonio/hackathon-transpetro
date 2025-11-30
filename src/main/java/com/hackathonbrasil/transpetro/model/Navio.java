package com.hackathonbrasil.transpetro.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "navios")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Navio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String nome;

    @Column(nullable = false, length = 50)
    private String classe; // Suezmax, Aframax, etc.

    @Column(nullable = false, length = 50)
    private String tipo; // Petroleiro, Gaseiro, etc.

    @Column(nullable = false)
    private Double porteBruto; // Deadweight Tonnage

    @Column(name = "comprimento_total")
    private Double comprimentoTotal; // em metros

    @Column
    private Double boca; // em metros

    @Column
    private Double calado; // em metros

    @Column
    private Double pontal; // em metros

    // Relacionamentos
    @OneToMany(mappedBy = "navio", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Docagem> docagens = new ArrayList<>();

    @OneToMany(mappedBy = "navio", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<EventoNavegacao> eventos = new ArrayList<>();

    @OneToMany(mappedBy = "navio", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Consumo> consumos = new ArrayList<>();

    @OneToMany(mappedBy = "navio", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Revestimento> revestimentos = new ArrayList<>();

    @OneToMany(mappedBy = "navio", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Relatorio> relatorios = new ArrayList<>();

    // Auditoria
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

