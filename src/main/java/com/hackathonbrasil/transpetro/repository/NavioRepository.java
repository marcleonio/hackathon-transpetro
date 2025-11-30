package com.hackathonbrasil.transpetro.repository;

import com.hackathonbrasil.transpetro.model.Navio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NavioRepository extends JpaRepository<Navio, Long> {

    Optional<Navio> findByNome(String nome);

    boolean existsByNome(String nome);
}

