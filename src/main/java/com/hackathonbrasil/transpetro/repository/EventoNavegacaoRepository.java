package com.hackathonbrasil.transpetro.repository;

import com.hackathonbrasil.transpetro.model.EventoNavegacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventoNavegacaoRepository extends JpaRepository<EventoNavegacao, Long> {

    List<EventoNavegacao> findByNavioIdOrderByStartGMTDateDesc(Long navioId);

    List<EventoNavegacao> findBySessionId(String sessionId);
    
    default Optional<EventoNavegacao> findFirstBySessionId(String sessionId) {
        List<EventoNavegacao> eventos = findBySessionId(sessionId);
        return eventos.isEmpty() ? Optional.empty() : Optional.of(eventos.get(0));
    }

    @Query("SELECT e FROM EventoNavegacao e WHERE e.navio.id = :navioId " +
           "AND e.startGMTDate >= :start AND e.startGMTDate <= :end " +
           "ORDER BY e.startGMTDate DESC")
    List<EventoNavegacao> findByNavioIdAndPeriod(
            @Param("navioId") Long navioId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Query("SELECT e FROM EventoNavegacao e WHERE e.navio.nome = :nomeNavio ORDER BY e.startGMTDate DESC")
    List<EventoNavegacao> findByNavioNomeOrderByStartGMTDateDesc(@Param("nomeNavio") String nomeNavio);
}

