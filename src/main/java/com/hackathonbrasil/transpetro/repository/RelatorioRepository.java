package com.hackathonbrasil.transpetro.repository;

import com.hackathonbrasil.transpetro.model.Relatorio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RelatorioRepository extends JpaRepository<Relatorio, Long> {

    List<Relatorio> findByNavioIdOrderByDataRegistroDesc(String navioId);

    List<Relatorio> findByTipoRelatorioOrderByDataRegistroDesc(String tipoRelatorio);

    List<Relatorio> findByStatusOrderByDataRegistroDesc(String status);

    List<Relatorio> findByNivelBioincrustacaoOrderByDataRegistroDesc(Integer nivelBioincrustacao);

    @Query("SELECT r FROM Relatorio r WHERE r.dataRegistro BETWEEN :dataInicio AND :dataFim ORDER BY r.dataRegistro DESC")
    List<Relatorio> findByDataRegistroBetween(
        @Param("dataInicio") LocalDateTime dataInicio,
        @Param("dataFim") LocalDateTime dataFim
    );

    @Query("SELECT r FROM Relatorio r WHERE " +
           "(:navioId IS NULL OR r.navioId = :navioId) AND " +
           "(:tipoRelatorio IS NULL OR r.tipoRelatorio = :tipoRelatorio) AND " +
           "(:status IS NULL OR r.status = :status) AND " +
           "(:nivelBioincrustacao IS NULL OR r.nivelBioincrustacao = :nivelBioincrustacao) " +
           "ORDER BY r.dataRegistro DESC")
    List<Relatorio> findWithFilters(
        @Param("navioId") String navioId,
        @Param("tipoRelatorio") String tipoRelatorio,
        @Param("status") String status,
        @Param("nivelBioincrustacao") Integer nivelBioincrustacao
    );

    @Query("SELECT r FROM Relatorio r WHERE " +
           "LOWER(r.titulo) LIKE LOWER(CONCAT('%', :busca, '%')) OR " +
           "LOWER(r.descricao) LIKE LOWER(CONCAT('%', :busca, '%')) " +
           "ORDER BY r.dataRegistro DESC")
    List<Relatorio> searchByText(@Param("busca") String busca);
}

