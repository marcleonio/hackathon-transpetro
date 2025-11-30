package com.hackathonbrasil.transpetro.repository;

import com.hackathonbrasil.transpetro.model.Consumo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConsumoRepository extends JpaRepository<Consumo, Long> {

    List<Consumo> findByNavioIdOrderByCreatedAtDesc(Long navioId);

    List<Consumo> findBySessionId(String sessionId);

    @Query("SELECT c FROM Consumo c WHERE c.navio.nome = :nomeNavio ORDER BY c.createdAt DESC")
    List<Consumo> findByNavioNomeOrderByCreatedAtDesc(@Param("nomeNavio") String nomeNavio);
}

