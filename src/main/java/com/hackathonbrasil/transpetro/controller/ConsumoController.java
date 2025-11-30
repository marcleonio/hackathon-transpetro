package com.hackathonbrasil.transpetro.controller;

import com.hackathonbrasil.transpetro.model.ConsumoRequestDto;
import com.hackathonbrasil.transpetro.model.ConsumoResponseDto;
import com.hackathonbrasil.transpetro.service.ConsumoService;
import io.swagger.v3.oas.annotations.Operation;
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

    @Operation(summary = "Listar todos os consumos")
    @GetMapping
    public ResponseEntity<List<ConsumoResponseDto>> listarTodos() {
        return ResponseEntity.ok(consumoService.listarTodos());
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

    @Operation(summary = "Listar consumos por navio")
    @GetMapping("/navio/{navioId}")
    public ResponseEntity<List<ConsumoResponseDto>> listarPorNavio(@PathVariable Long navioId) {
        return ResponseEntity.ok(consumoService.listarPorNavio(navioId));
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

