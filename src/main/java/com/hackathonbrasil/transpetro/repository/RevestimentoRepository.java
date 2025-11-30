package com.hackathonbrasil.transpetro.repository;

import com.hackathonbrasil.transpetro.model.Revestimento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RevestimentoRepository extends JpaRepository<Revestimento, Long> {

    List<Revestimento> findByNavioIdOrderByDataAplicacaoDesc(Long navioId);

    default Optional<Revestimento> findUltimoRevestimentoByNavioId(Long navioId) {
        List<Revestimento> revestimentos = findByNavioIdOrderByDataAplicacaoDesc(navioId);
        return revestimentos.isEmpty() ? Optional.empty() : Optional.of(revestimentos.get(0));
    }

    default Optional<Revestimento> findUltimoRevestimentoByNavioNome(String nomeNavio) {
        List<Revestimento> revestimentos = findByNavioNomeOrderByDataAplicacaoDesc(nomeNavio);
        return revestimentos.isEmpty() ? Optional.empty() : Optional.of(revestimentos.get(0));
    }

    @Query("SELECT r FROM Revestimento r WHERE r.navio.nome = :nomeNavio ORDER BY r.dataAplicacao DESC")
    List<Revestimento> findByNavioNomeOrderByDataAplicacaoDesc(@Param("nomeNavio") String nomeNavio);
}

