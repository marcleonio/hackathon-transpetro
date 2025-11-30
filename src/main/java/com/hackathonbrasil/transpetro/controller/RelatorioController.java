package com.hackathonbrasil.transpetro.controller;

import com.hackathonbrasil.transpetro.model.RelatorioRequestDto;
import com.hackathonbrasil.transpetro.model.RelatorioResponseDto;
import com.hackathonbrasil.transpetro.service.RelatorioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
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
@Tag(name = "Relatórios de Marinheiros", description = "CRUD completo para registro de relatórios pelos marinheiros")
public class RelatorioController {

    @Autowired
    private RelatorioService relatorioService;

    @Operation(summary = "Listar todos os relatórios",
               description = "Retorna todos os relatórios cadastrados, ordenados por data de registro (mais recentes primeiro)")
    @ApiResponse(responseCode = "200", description = "Lista de relatórios retornada com sucesso")
    @GetMapping
    public ResponseEntity<List<RelatorioResponseDto>> listarTodos() {
        List<RelatorioResponseDto> relatorios = relatorioService.listarTodos();
        return ResponseEntity.ok(relatorios);
    }

    @Operation(summary = "Buscar relatório por ID",
               description = "Retorna um relatório específico pelo seu ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Relatório encontrado"),
        @ApiResponse(responseCode = "404", description = "Relatório não encontrado")
    })
    @GetMapping("/{id}")
    public ResponseEntity<RelatorioResponseDto> buscarPorId(
            @Parameter(description = "ID do relatório") @PathVariable Long id) {
        try {
            RelatorioResponseDto relatorio = relatorioService.buscarPorId(id);
            return ResponseEntity.ok(relatorio);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Listar relatórios por navio",
               description = "Retorna todos os relatórios de um navio específico")
    @ApiResponse(responseCode = "200", description = "Lista de relatórios do navio")
    @GetMapping("/navio/{navioId}")
    public ResponseEntity<List<RelatorioResponseDto>> listarPorNavio(
            @Parameter(description = "ID ou nome do navio") @PathVariable String navioId) {
        List<RelatorioResponseDto> relatorios = relatorioService.listarPorNavio(navioId);
        return ResponseEntity.ok(relatorios);
    }

    @Operation(summary = "Listar relatórios por tipo",
               description = "Retorna todos os relatórios de um tipo específico (INSPECAO, LIMPEZA, OBSERVACAO, CONSUMO)")
    @ApiResponse(responseCode = "200", description = "Lista de relatórios do tipo especificado")
    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<List<RelatorioResponseDto>> listarPorTipo(
            @Parameter(description = "Tipo de relatório: INSPECAO, LIMPEZA, OBSERVACAO, CONSUMO")
            @PathVariable String tipo) {
        List<RelatorioResponseDto> relatorios = relatorioService.listarPorTipo(tipo);
        return ResponseEntity.ok(relatorios);
    }

    @Operation(summary = "Listar relatórios por status",
               description = "Retorna todos os relatórios com um status específico (RASCUNHO, FINALIZADO, ARQUIVADO)")
    @ApiResponse(responseCode = "200", description = "Lista de relatórios com o status especificado")
    @GetMapping("/status/{status}")
    public ResponseEntity<List<RelatorioResponseDto>> listarPorStatus(
            @Parameter(description = "Status do relatório: RASCUNHO, FINALIZADO, ARQUIVADO")
            @PathVariable String status) {
        List<RelatorioResponseDto> relatorios = relatorioService.listarPorStatus(status);
        return ResponseEntity.ok(relatorios);
    }

    @Operation(summary = "Listar relatórios por navio e tipo",
               description = "Retorna todos os relatórios de um navio e tipo específicos")
    @ApiResponse(responseCode = "200", description = "Lista de relatórios filtrados")
    @GetMapping("/navio/{navioId}/tipo/{tipo}")
    public ResponseEntity<List<RelatorioResponseDto>> listarPorNavioETipo(
            @Parameter(description = "ID ou nome do navio") @PathVariable String navioId,
            @Parameter(description = "Tipo de relatório") @PathVariable String tipo) {
        List<RelatorioResponseDto> relatorios = relatorioService.listarPorNavioETipo(navioId, tipo);
        return ResponseEntity.ok(relatorios);
    }

    @Operation(summary = "Listar relatórios por nível de bioincrustação",
               description = "Retorna todos os relatórios com um nível específico de bioincrustação (0-4)")
    @ApiResponse(responseCode = "200", description = "Lista de relatórios com o nível especificado")
    @GetMapping("/nivel/{nivel}")
    public ResponseEntity<List<RelatorioResponseDto>> listarPorNivelBioincrustacao(
            @Parameter(description = "Nível de bioincrustação (0-4)") @PathVariable Integer nivel) {
        if (nivel < 0 || nivel > 4) {
            return ResponseEntity.badRequest().build();
        }
        List<RelatorioResponseDto> relatorios = relatorioService.listarPorNivelBioincrustacao(nivel);
        return ResponseEntity.ok(relatorios);
    }

    @Operation(summary = "Listar relatórios por range de datas",
               description = "Retorna todos os relatórios registrados entre duas datas")
    @ApiResponse(responseCode = "200", description = "Lista de relatórios no período especificado")
    @GetMapping("/periodo")
    public ResponseEntity<List<RelatorioResponseDto>> listarPorRangeDatas(
            @Parameter(description = "Data de início (formato: yyyy-MM-ddTHH:mm:ss)")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataInicio,
            @Parameter(description = "Data de fim (formato: yyyy-MM-ddTHH:mm:ss)")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataFim) {
        List<RelatorioResponseDto> relatorios = relatorioService.listarPorRangeDatas(dataInicio, dataFim);
        return ResponseEntity.ok(relatorios);
    }

    @Operation(summary = "Listar relatórios por navio e range de datas",
               description = "Retorna todos os relatórios de um navio registrados entre duas datas")
    @ApiResponse(responseCode = "200", description = "Lista de relatórios filtrados")
    @GetMapping("/navio/{navioId}/periodo")
    public ResponseEntity<List<RelatorioResponseDto>> listarPorNavioERangeDatas(
            @Parameter(description = "ID ou nome do navio") @PathVariable String navioId,
            @Parameter(description = "Data de início (formato: yyyy-MM-ddTHH:mm:ss)")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataInicio,
            @Parameter(description = "Data de fim (formato: yyyy-MM-ddTHH:mm:ss)")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataFim) {
        List<RelatorioResponseDto> relatorios = relatorioService.listarPorNavioERangeDatas(navioId, dataInicio, dataFim);
        return ResponseEntity.ok(relatorios);
    }

    @Operation(summary = "Buscar relatórios por termo",
               description = "Busca textual em títulos, descrições e observações dos relatórios")
    @ApiResponse(responseCode = "200", description = "Lista de relatórios encontrados")
    @GetMapping("/busca")
    public ResponseEntity<List<RelatorioResponseDto>> buscarPorTermo(
            @Parameter(description = "Termo de busca") @RequestParam String termo) {
        List<RelatorioResponseDto> relatorios = relatorioService.buscarPorTermo(termo);
        return ResponseEntity.ok(relatorios);
    }

    @Operation(summary = "Buscar relatórios por navio e termo",
               description = "Busca textual em relatórios de um navio específico")
    @ApiResponse(responseCode = "200", description = "Lista de relatórios encontrados")
    @GetMapping("/navio/{navioId}/busca")
    public ResponseEntity<List<RelatorioResponseDto>> buscarPorNavioETermo(
            @Parameter(description = "ID ou nome do navio") @PathVariable String navioId,
            @Parameter(description = "Termo de busca") @RequestParam String termo) {
        List<RelatorioResponseDto> relatorios = relatorioService.buscarPorNavioETermo(navioId, termo);
        return ResponseEntity.ok(relatorios);
    }

    @Operation(summary = "Criar novo relatório",
               description = "Cria um novo relatório no sistema")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Relatório criado com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos")
    })
    @PostMapping
    public ResponseEntity<RelatorioResponseDto> criar(@RequestBody RelatorioRequestDto dto) {
        try {
            RelatorioResponseDto relatorio = relatorioService.criar(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(relatorio);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @Operation(summary = "Atualizar relatório existente",
               description = "Atualiza um relatório existente pelo seu ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Relatório atualizado com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos"),
        @ApiResponse(responseCode = "404", description = "Relatório não encontrado")
    })
    @PutMapping("/{id}")
    public ResponseEntity<RelatorioResponseDto> atualizar(
            @Parameter(description = "ID do relatório") @PathVariable Long id,
            @RequestBody RelatorioRequestDto dto) {
        try {
            RelatorioResponseDto relatorio = relatorioService.atualizar(id, dto);
            return ResponseEntity.ok(relatorio);
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("não encontrado")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().build();
        }
    }

    @Operation(summary = "Deletar relatório",
               description = "Remove um relatório do sistema")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Relatório deletado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Relatório não encontrado")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(
            @Parameter(description = "ID do relatório") @PathVariable Long id) {
        try {
            relatorioService.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

