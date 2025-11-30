package com.hackathonbrasil.transpetro.repository;

import com.hackathonbrasil.transpetro.model.Docagem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DocagemRepository extends JpaRepository<Docagem, Long> {

    List<Docagem> findByNavioIdOrderByDataDocagemDesc(Long navioId);

    @Query("SELECT d FROM Docagem d WHERE d.navio.id = :navioId ORDER BY d.dataDocagem DESC")
    Optional<Docagem> findFirstByNavioIdOrderByDataDocagemDesc(@Param("navioId") Long navioId);

    default Optional<Docagem> findUltimaDocagemByNavioId(Long navioId) {
        List<Docagem> docagens = findByNavioIdOrderByDataDocagemDesc(navioId);
        return docagens.isEmpty() ? Optional.empty() : Optional.of(docagens.get(0));
    }

    @Query("SELECT d FROM Docagem d WHERE d.navio.nome = :nomeNavio ORDER BY d.dataDocagem DESC")
    List<Docagem> findByNavioNomeOrderByDataDocagemDesc(@Param("nomeNavio") String nomeNavio);

    default Optional<Docagem> findUltimaDocagemByNavioNome(String nomeNavio) {
        List<Docagem> docagens = findByNavioNomeOrderByDataDocagemDesc(nomeNavio);
        return docagens.isEmpty() ? Optional.empty() : Optional.of(docagens.get(0));
    }
}

