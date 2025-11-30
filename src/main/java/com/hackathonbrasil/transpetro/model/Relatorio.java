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

<<<<<<< HEAD
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
=======
    // Identificação
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "navio_id")
    private Navio navio;

    @Column(name = "navio_nome", length = 100)
    private String navioId;              // Nome do navio (ex: "RAFAEL SANTOS") - mantido para compatibilidade

    @Column(nullable = false)
    private String tipoRelatorio;        // INSPECAO, LIMPEZA, OBSERVACAO, CONSUMO

    @Column(nullable = false)
    private LocalDateTime dataRegistro;  // Data/hora do registro

    @Column(nullable = false)
    private String registradoPor;        // Nome/ID do marinheiro que registrou

    // Dados do Relatório
    @Column(nullable = false)
    private String titulo;               // Título do relatório

    @Column(columnDefinition = "TEXT")
    private String descricao;            // Descrição detalhada

    private String localizacao;          // Localização no navio (ex: "Proa", "Bombordo", "Casco completo")

    // Dados Técnicos (opcionais, dependendo do tipo)
    @Column(name = "nivel_bioincrustacao")
    private Integer nivelBioincrustacao; // 0-4 (se aplicável)

    @Column(name = "consumo_observado")
    private Double consumoObservado;     // Consumo observado (se tipo = CONSUMO)

    @Column(name = "tipo_limpeza")
    private String tipoLimpeza;          // "Parcial", "Completa", "Em Docagem" (se tipo = LIMPEZA)

    @Column(name = "data_limpeza")
    private LocalDate dataLimpeza;       // Data da limpeza (se tipo = LIMPEZA)

    // Metadados
    @Column(nullable = false)
    private String status;               // "RASCUNHO", "FINALIZADO", "ARQUIVADO"

    @Column(columnDefinition = "TEXT")
    private String anexos;               // URLs ou paths de fotos/documentos (JSON array)

    private String coordenadas;          // Lat/Long se relevante

    @Column(name = "observacoes_adicionais", columnDefinition = "TEXT")
    private String observacoesAdicionais;

    // Auditoria
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
>>>>>>> master
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

