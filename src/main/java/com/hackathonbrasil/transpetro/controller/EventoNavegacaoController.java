package com.hackathonbrasil.transpetro.controller;

import com.hackathonbrasil.transpetro.model.EventoNavegacaoRequestDto;
import com.hackathonbrasil.transpetro.model.EventoNavegacaoResponseDto;
import com.hackathonbrasil.transpetro.model.PageResponseDto;
import com.hackathonbrasil.transpetro.service.EventoNavegacaoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/eventos")
@Tag(name = "Eventos de Navegação", description = "CRUD completo para gestão de eventos de navegação")
public class EventoNavegacaoController {

    @Autowired
    private EventoNavegacaoService eventoService;

    @Operation(summary = "Listar todos os eventos (paginado)",
               description = "Retorna eventos paginados. Use page e size para controlar a paginação.")
    @GetMapping
    public ResponseEntity<PageResponseDto<EventoNavegacaoResponseDto>> listarTodos(
            @Parameter(description = "Número da página (começa em 0)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Tamanho da página (máximo recomendado: 100)", example = "20")
            @RequestParam(defaultValue = "20") int size) {
        // Limita o tamanho máximo da página para evitar sobrecarga
        if (size > 100) size = 100;
        return ResponseEntity.ok(eventoService.listarTodos(page, size));
    }

    @Operation(summary = "Buscar evento por ID")
    @GetMapping("/{id}")
    public ResponseEntity<EventoNavegacaoResponseDto> buscarPorId(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(eventoService.buscarPorId(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Listar eventos por navio (paginado)")
    @GetMapping("/navio/{navioId}")
    public ResponseEntity<PageResponseDto<EventoNavegacaoResponseDto>> listarPorNavio(
            @PathVariable Long navioId,
            @Parameter(description = "Número da página (começa em 0)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Tamanho da página (máximo recomendado: 100)", example = "20")
            @RequestParam(defaultValue = "20") int size) {
        if (size > 100) size = 100;
        return ResponseEntity.ok(eventoService.listarPorNavio(navioId, page, size));
    }

    @Operation(summary = "Listar eventos por período (paginado)")
    @GetMapping("/navio/{navioId}/periodo")
    public ResponseEntity<PageResponseDto<EventoNavegacaoResponseDto>> listarPorPeriodo(
            @PathVariable Long navioId,
            @Parameter(description = "Data de início (formato: yyyy-MM-ddTHH:mm:ss)")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @Parameter(description = "Data de fim (formato: yyyy-MM-ddTHH:mm:ss)")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @Parameter(description = "Número da página (começa em 0)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Tamanho da página (máximo recomendado: 100)", example = "20")
            @RequestParam(defaultValue = "20") int size) {
        if (size > 100) size = 100;
        return ResponseEntity.ok(eventoService.listarPorPeriodo(navioId, start, end, page, size));
    }

    @Operation(summary = "Criar novo evento")
    @PostMapping
    public ResponseEntity<EventoNavegacaoResponseDto> criar(@RequestBody EventoNavegacaoRequestDto dto) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(eventoService.criar(dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @Operation(summary = "Atualizar evento")
    @PutMapping("/{id}")
    public ResponseEntity<EventoNavegacaoResponseDto> atualizar(@PathVariable Long id, @RequestBody EventoNavegacaoRequestDto dto) {
        try {
            return ResponseEntity.ok(eventoService.atualizar(id, dto));
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("não encontrado")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().build();
        }
    }

    @Operation(summary = "Deletar evento")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        try {
            eventoService.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

