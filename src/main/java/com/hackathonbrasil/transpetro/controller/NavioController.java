package com.hackathonbrasil.transpetro.controller;

import com.hackathonbrasil.transpetro.model.NavioRequestDto;
import com.hackathonbrasil.transpetro.model.NavioResponseDto;
import com.hackathonbrasil.transpetro.service.NavioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/navios")
@Tag(name = "Navios", description = "CRUD completo para gestão de navios")
public class NavioController {

    @Autowired
    private NavioService navioService;

    @Operation(summary = "Listar todos os navios")
    @GetMapping
    public ResponseEntity<List<NavioResponseDto>> listarTodos() {
        return ResponseEntity.ok(navioService.listarTodos());
    }

    @Operation(summary = "Buscar navio por ID")
    @GetMapping("/{id}")
    public ResponseEntity<NavioResponseDto> buscarPorId(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(navioService.buscarPorId(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Buscar navio por nome")
    @GetMapping("/nome/{nome}")
    public ResponseEntity<NavioResponseDto> buscarPorNome(@PathVariable String nome) {
        try {
            return ResponseEntity.ok(navioService.buscarPorNome(nome));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Criar novo navio")
    @PostMapping
    public ResponseEntity<NavioResponseDto> criar(@RequestBody NavioRequestDto dto) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(navioService.criar(dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @Operation(summary = "Atualizar navio")
    @PutMapping("/{id}")
    public ResponseEntity<NavioResponseDto> atualizar(@PathVariable Long id, @RequestBody NavioRequestDto dto) {
        try {
            return ResponseEntity.ok(navioService.atualizar(id, dto));
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("não encontrado")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().build();
        }
    }

    @Operation(summary = "Deletar navio")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        try {
            navioService.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

