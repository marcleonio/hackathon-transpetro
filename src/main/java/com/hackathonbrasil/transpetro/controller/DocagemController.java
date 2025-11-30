package com.hackathonbrasil.transpetro.controller;

import com.hackathonbrasil.transpetro.model.DocagemRequestDto;
import com.hackathonbrasil.transpetro.model.DocagemResponseDto;
import com.hackathonbrasil.transpetro.service.DocagemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/docagens")
@Tag(name = "Docagens", description = "CRUD completo para gestão de docagens")
public class DocagemController {

    @Autowired
    private DocagemService docagemService;

    @Operation(summary = "Listar todas as docagens")
    @GetMapping
    public ResponseEntity<List<DocagemResponseDto>> listarTodos() {
        return ResponseEntity.ok(docagemService.listarTodos());
    }

    @Operation(summary = "Buscar docagem por ID")
    @GetMapping("/{id}")
    public ResponseEntity<DocagemResponseDto> buscarPorId(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(docagemService.buscarPorId(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Listar docagens por navio")
    @GetMapping("/navio/{navioId}")
    public ResponseEntity<List<DocagemResponseDto>> listarPorNavio(@PathVariable Long navioId) {
        return ResponseEntity.ok(docagemService.listarPorNavio(navioId));
    }

    @Operation(summary = "Buscar última docagem por navio")
    @GetMapping("/navio/{navioId}/ultima")
    public ResponseEntity<DocagemResponseDto> buscarUltimaDocagem(@PathVariable Long navioId) {
        try {
            return ResponseEntity.ok(docagemService.buscarUltimaDocagemPorNavio(navioId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Criar nova docagem")
    @PostMapping
    public ResponseEntity<DocagemResponseDto> criar(@RequestBody DocagemRequestDto dto) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(docagemService.criar(dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @Operation(summary = "Atualizar docagem")
    @PutMapping("/{id}")
    public ResponseEntity<DocagemResponseDto> atualizar(@PathVariable Long id, @RequestBody DocagemRequestDto dto) {
        try {
            return ResponseEntity.ok(docagemService.atualizar(id, dto));
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("não encontrado")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().build();
        }
    }

    @Operation(summary = "Deletar docagem")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        try {
            docagemService.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

