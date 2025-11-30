package com.hackathonbrasil.transpetro.controller;

import com.hackathonbrasil.transpetro.model.dto.RelatorioRequestDto;
import com.hackathonbrasil.transpetro.model.dto.RelatorioResponseDto;
import com.hackathonbrasil.transpetro.service.RelatorioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/relatorios")
@Tag(name = "Relatórios", description = "Endpoints para gerenciamento de relatórios de marinheiros")
public class RelatorioController {

    @Autowired
    private RelatorioService relatorioService;

    @Operation(summary = "Listar todos os relatórios", description = "Retorna todos os relatórios cadastrados")
    @GetMapping
    public ResponseEntity<List<RelatorioResponseDto>> findAll() {
        return ResponseEntity.ok(relatorioService.findAll());
    }

    @Operation(summary = "Buscar relatório por ID", description = "Retorna um relatório específico pelo ID")
    @GetMapping("/{id}")
    public ResponseEntity<RelatorioResponseDto> findById(
        @Parameter(description = "ID do relatório") @PathVariable Long id
    ) {
        return ResponseEntity.ok(relatorioService.findById(id));
    }

    @Operation(summary = "Listar relatórios por navio", description = "Retorna todos os relatórios de um navio específico")
    @GetMapping("/navio/{navioId}")
    public ResponseEntity<List<RelatorioResponseDto>> findByNavioId(
        @Parameter(description = "ID do navio") @PathVariable String navioId
    ) {
        return ResponseEntity.ok(relatorioService.findByNavioId(navioId));
    }

    @Operation(summary = "Listar relatórios por tipo", description = "Retorna relatórios filtrados por tipo (INSPECAO, LIMPEZA, OBSERVACAO, CONSUMO)")
    @GetMapping("/tipo/{tipoRelatorio}")
    public ResponseEntity<List<RelatorioResponseDto>> findByTipo(
        @Parameter(description = "Tipo do relatório") @PathVariable String tipoRelatorio
    ) {
        return ResponseEntity.ok(relatorioService.findByTipo(tipoRelatorio));
    }

    @Operation(summary = "Listar relatórios por status", description = "Retorna relatórios filtrados por status (RASCUNHO, FINALIZADO, ARQUIVADO)")
    @GetMapping("/status/{status}")
    public ResponseEntity<List<RelatorioResponseDto>> findByStatus(
        @Parameter(description = "Status do relatório") @PathVariable String status
    ) {
        return ResponseEntity.ok(relatorioService.findByStatus(status));
    }

    @Operation(summary = "Listar relatórios por nível de bioincrustação", description = "Retorna relatórios filtrados por nível (0-4)")
    @GetMapping("/nivel/{nivel}")
    public ResponseEntity<List<RelatorioResponseDto>> findByNivelBioincrustacao(
        @Parameter(description = "Nível de bioincrustação (0-4)") @PathVariable Integer nivel
    ) {
        return ResponseEntity.ok(relatorioService.findByNivelBioincrustacao(nivel));
    }

    @Operation(summary = "Buscar relatórios por período", description = "Retorna relatórios dentro de um intervalo de datas")
    @GetMapping("/periodo")
    public ResponseEntity<List<RelatorioResponseDto>> findByDataRange(
        @Parameter(description = "Data inicial (formato: yyyy-MM-ddTHH:mm:ss)") 
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataInicio,
        @Parameter(description = "Data final (formato: yyyy-MM-ddTHH:mm:ss)") 
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataFim
    ) {
        return ResponseEntity.ok(relatorioService.findByDataRange(dataInicio, dataFim));
    }

    @Operation(summary = "Buscar relatórios com filtros combinados", description = "Retorna relatórios filtrados por múltiplos critérios")
    @GetMapping("/filtros")
    public ResponseEntity<List<RelatorioResponseDto>> findWithFilters(
        @Parameter(description = "ID do navio") @RequestParam(required = false) String navioId,
        @Parameter(description = "Tipo do relatório") @RequestParam(required = false) String tipoRelatorio,
        @Parameter(description = "Status do relatório") @RequestParam(required = false) String status,
        @Parameter(description = "Nível de bioincrustação") @RequestParam(required = false) Integer nivelBioincrustacao
    ) {
        return ResponseEntity.ok(relatorioService.findWithFilters(navioId, tipoRelatorio, status, nivelBioincrustacao));
    }

    @Operation(summary = "Buscar relatórios por texto", description = "Busca relatórios por título ou descrição")
    @GetMapping("/busca")
    public ResponseEntity<List<RelatorioResponseDto>> searchByText(
        @Parameter(description = "Texto para busca") @RequestParam String busca
    ) {
        return ResponseEntity.ok(relatorioService.searchByText(busca));
    }

    @Operation(summary = "Criar novo relatório", description = "Cria um novo relatório no sistema")
    @ApiResponse(responseCode = "201", description = "Relatório criado com sucesso")
    @PostMapping
    public ResponseEntity<RelatorioResponseDto> create(
        @RequestBody RelatorioRequestDto dto,
        @Parameter(description = "Nome/ID do usuário que está registrando") 
        @RequestParam(defaultValue = "Sistema") String registradoPor
    ) {
        RelatorioResponseDto created = relatorioService.create(dto, registradoPor);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Operation(summary = "Atualizar relatório", description = "Atualiza um relatório existente")
    @PutMapping("/{id}")
    public ResponseEntity<RelatorioResponseDto> update(
        @Parameter(description = "ID do relatório") @PathVariable Long id,
        @RequestBody RelatorioRequestDto dto
    ) {
        return ResponseEntity.ok(relatorioService.update(id, dto));
    }

    @Operation(summary = "Deletar relatório", description = "Remove um relatório do sistema")
    @ApiResponse(responseCode = "204", description = "Relatório deletado com sucesso")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
        @Parameter(description = "ID do relatório") @PathVariable Long id
    ) {
        relatorioService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

