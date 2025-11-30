package com.hackathonbrasil.transpetro.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "eventos_navegacao")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventoNavegacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "navio_id", nullable = false)
    private Navio navio;

    @Column(nullable = false, unique = true, length = 50)
    private String sessionId;

    @Column(nullable = false, length = 50)
    private String eventName;

    @Column(nullable = false)
    private LocalDateTime startGMTDate;

    @Column
    private LocalDateTime endGMTDate;

    @Column(nullable = false)
    private Double duration;

    @Column
    private Double distance;

    @Column(name = "aft_draft")
    private Double aftDraft;

    @Column(name = "fwd_draft")
    private Double fwdDraft;

    @Column(name = "mid_draft")
    private Double midDraft;

    @Column
    private Double trim;

    @Column
    private Double displacement;

    @Column(name = "beaufort_scale")
    private Integer beaufortScale;

    @Column(name = "sea_condition", length = 100)
    private String seaCondition;

    @Column
    private Double speed;

    @Column(name = "speed_gps")
    private Double speedGps;

    @Column(length = 100)
    private String porto;

    @Column(name = "dec_latitude")
    private Double decLatitude;

    @Column(name = "dec_longitude")
    private Double decLongitude;

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

