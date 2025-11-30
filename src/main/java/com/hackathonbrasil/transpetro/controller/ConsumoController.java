package com.hackathonbrasil.transpetro.controller;

import com.hackathonbrasil.transpetro.model.ConsumoRequestDto;
import com.hackathonbrasil.transpetro.model.ConsumoResponseDto;
import com.hackathonbrasil.transpetro.model.PageResponseDto;
import com.hackathonbrasil.transpetro.service.ConsumoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/consumos")
@Tag(name = "Consumos", description = "CRUD completo para gestão de consumos de combustível")
public class ConsumoController {

    @Autowired
    private ConsumoService consumoService;

    @Operation(summary = "Listar todos os consumos (paginado)",
               description = "Retorna consumos paginados. Use page e size para controlar a paginação.")
    @GetMapping
    public ResponseEntity<PageResponseDto<ConsumoResponseDto>> listarTodos(
            @Parameter(description = "Número da página (começa em 0)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Tamanho da página (máximo recomendado: 100)", example = "20")
            @RequestParam(defaultValue = "20") int size) {
        // Limita o tamanho máximo da página para evitar sobrecarga
        if (size > 100) size = 100;
        return ResponseEntity.ok(consumoService.listarTodos(page, size));
    }

    @Operation(summary = "Buscar consumo por ID")
    @GetMapping("/{id}")
    public ResponseEntity<ConsumoResponseDto> buscarPorId(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(consumoService.buscarPorId(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Listar consumos por navio (paginado)")
    @GetMapping("/navio/{navioId}")
    public ResponseEntity<PageResponseDto<ConsumoResponseDto>> listarPorNavio(
            @PathVariable Long navioId,
            @Parameter(description = "Número da página (começa em 0)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Tamanho da página (máximo recomendado: 100)", example = "20")
            @RequestParam(defaultValue = "20") int size) {
        if (size > 100) size = 100;
        return ResponseEntity.ok(consumoService.listarPorNavio(navioId, page, size));
    }

    @Operation(summary = "Criar novo consumo")
    @PostMapping
    public ResponseEntity<ConsumoResponseDto> criar(@RequestBody ConsumoRequestDto dto) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(consumoService.criar(dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @Operation(summary = "Atualizar consumo")
    @PutMapping("/{id}")
    public ResponseEntity<ConsumoResponseDto> atualizar(@PathVariable Long id, @RequestBody ConsumoRequestDto dto) {
        try {
            return ResponseEntity.ok(consumoService.atualizar(id, dto));
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("não encontrado")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().build();
        }
    }

    @Operation(summary = "Deletar consumo")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        try {
            consumoService.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

