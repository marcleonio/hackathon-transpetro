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

    // Buscar por navio
    List<Relatorio> findByNavioIdOrderByDataRegistroDesc(String navioId);

    // Buscar por tipo
    List<Relatorio> findByTipoRelatorioOrderByDataRegistroDesc(String tipoRelatorio);

    // Buscar por status
    List<Relatorio> findByStatusOrderByDataRegistroDesc(String status);

    // Buscar por navio e tipo
    List<Relatorio> findByNavioIdAndTipoRelatorioOrderByDataRegistroDesc(String navioId, String tipoRelatorio);

    // Buscar por navio e status
    List<Relatorio> findByNavioIdAndStatusOrderByDataRegistroDesc(String navioId, String status);

    // Buscar por nível de bioincrustação
    List<Relatorio> findByNivelBioincrustacaoOrderByDataRegistroDesc(Integer nivelBioincrustacao);

    // Buscar por range de datas
    List<Relatorio> findByDataRegistroBetweenOrderByDataRegistroDesc(
            LocalDateTime dataInicio, LocalDateTime dataFim);

    // Buscar por navio e range de datas
    List<Relatorio> findByNavioIdAndDataRegistroBetweenOrderByDataRegistroDesc(
            String navioId, LocalDateTime dataInicio, LocalDateTime dataFim);

    // Busca textual (título ou descrição)
    @Query("SELECT r FROM Relatorio r WHERE " +
           "LOWER(r.titulo) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           "LOWER(r.descricao) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           "LOWER(r.observacoesAdicionais) LIKE LOWER(CONCAT('%', :termo, '%')) " +
           "ORDER BY r.dataRegistro DESC")
    List<Relatorio> buscarPorTermo(@Param("termo") String termo);

    // Busca textual por navio
    @Query("SELECT r FROM Relatorio r WHERE r.navioId = :navioId AND " +
           "(LOWER(r.titulo) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           "LOWER(r.descricao) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           "LOWER(r.observacoesAdicionais) LIKE LOWER(CONCAT('%', :termo, '%'))) " +
           "ORDER BY r.dataRegistro DESC")
    List<Relatorio> buscarPorNavioETermo(@Param("navioId") String navioId, @Param("termo") String termo);
}

