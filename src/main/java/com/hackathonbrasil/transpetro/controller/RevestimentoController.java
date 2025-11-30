package com.hackathonbrasil.transpetro.controller;

import com.hackathonbrasil.transpetro.model.RevestimentoRequestDto;
import com.hackathonbrasil.transpetro.model.RevestimentoResponseDto;
import com.hackathonbrasil.transpetro.service.RevestimentoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/revestimentos")
@Tag(name = "Revestimentos", description = "CRUD completo para gestão de revestimentos anti-incrustantes")
public class RevestimentoController {

    @Autowired
    private RevestimentoService revestimentoService;

    @Operation(summary = "Listar todos os revestimentos")
    @GetMapping
    public ResponseEntity<List<RevestimentoResponseDto>> listarTodos() {
        return ResponseEntity.ok(revestimentoService.listarTodos());
    }

    @Operation(summary = "Buscar revestimento por ID")
    @GetMapping("/{id}")
    public ResponseEntity<RevestimentoResponseDto> buscarPorId(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(revestimentoService.buscarPorId(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Listar revestimentos por navio")
    @GetMapping("/navio/{navioId}")
    public ResponseEntity<List<RevestimentoResponseDto>> listarPorNavio(@PathVariable Long navioId) {
        return ResponseEntity.ok(revestimentoService.listarPorNavio(navioId));
    }

    @Operation(summary = "Buscar último revestimento por navio")
    @GetMapping("/navio/{navioId}/ultimo")
    public ResponseEntity<RevestimentoResponseDto> buscarUltimoRevestimento(@PathVariable Long navioId) {
        try {
            return ResponseEntity.ok(revestimentoService.buscarUltimoRevestimentoPorNavio(navioId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Criar novo revestimento")
    @PostMapping
    public ResponseEntity<RevestimentoResponseDto> criar(@RequestBody RevestimentoRequestDto dto) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(revestimentoService.criar(dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @Operation(summary = "Atualizar revestimento")
    @PutMapping("/{id}")
    public ResponseEntity<RevestimentoResponseDto> atualizar(@PathVariable Long id, @RequestBody RevestimentoRequestDto dto) {
        try {
            return ResponseEntity.ok(revestimentoService.atualizar(id, dto));
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("não encontrado")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().build();
        }
    }

    @Operation(summary = "Deletar revestimento")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        try {
            revestimentoService.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

