package com.hackathonbrasil.transpetro.service;

import com.hackathonbrasil.transpetro.model.Relatorio;
import com.hackathonbrasil.transpetro.model.RelatorioRequestDto;
import com.hackathonbrasil.transpetro.model.RelatorioResponseDto;
import com.hackathonbrasil.transpetro.repository.RelatorioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RelatorioServiceTest {

    @Mock
    private RelatorioRepository relatorioRepository;

    @InjectMocks
    private RelatorioService relatorioService;

    private RelatorioRequestDto requestDto;
    private Relatorio relatorio;

    @BeforeEach
    void setUp() {
        requestDto = new RelatorioRequestDto();
        requestDto.setNavioId("RAFAEL SANTOS");
        requestDto.setTipoRelatorio("INSPECAO");
        requestDto.setTitulo("Inspeção do Casco - Proa");
        requestDto.setDescricao("Observada bioincrustação moderada na região da proa");
        requestDto.setLocalizacao("Proa");
        requestDto.setNivelBioincrustacao(2);
        requestDto.setRegistradoPor("João Silva");
        requestDto.setStatus("FINALIZADO");

        relatorio = new Relatorio();
        relatorio.setId(1L);
        relatorio.setNavioId("RAFAEL SANTOS");
        relatorio.setTipoRelatorio("INSPECAO");
        relatorio.setTitulo("Inspeção do Casco - Proa");
        relatorio.setDescricao("Observada bioincrustação moderada na região da proa");
        relatorio.setLocalizacao("Proa");
        relatorio.setNivelBioincrustacao(2);
        relatorio.setRegistradoPor("João Silva");
        relatorio.setStatus("FINALIZADO");
        relatorio.setDataRegistro(LocalDateTime.now());
        relatorio.setCreatedAt(LocalDateTime.now());
        relatorio.setUpdatedAt(LocalDateTime.now());
        relatorio.setAnexos("[]");
    }

    @Test
    void testCriarRelatorio_Sucesso() {
        when(relatorioRepository.save(any(Relatorio.class))).thenReturn(relatorio);

        RelatorioResponseDto response = relatorioService.criar(requestDto);

        assertNotNull(response);
        assertEquals("RAFAEL SANTOS", response.getNavioId());
        assertEquals("INSPECAO", response.getTipoRelatorio());
        assertEquals("Inspeção do Casco - Proa", response.getTitulo());
        assertEquals(2, response.getNivelBioincrustacao());
        verify(relatorioRepository, times(1)).save(any(Relatorio.class));
    }

    @Test
    void testCriarRelatorio_NavioIdObrigatorio() {
        requestDto.setNavioId(null);

        assertThrows(IllegalArgumentException.class, () -> {
            relatorioService.criar(requestDto);
        });

        verify(relatorioRepository, never()).save(any());
    }

    @Test
    void testCriarRelatorio_TipoInvalido() {
        requestDto.setTipoRelatorio("TIPO_INVALIDO");

        assertThrows(IllegalArgumentException.class, () -> {
            relatorioService.criar(requestDto);
        });

        verify(relatorioRepository, never()).save(any());
    }

    @Test
    void testCriarRelatorio_TituloObrigatorio() {
        requestDto.setTitulo(null);

        assertThrows(IllegalArgumentException.class, () -> {
            relatorioService.criar(requestDto);
        });

        verify(relatorioRepository, never()).save(any());
    }

    @Test
    void testCriarRelatorio_NivelBioincrustacaoInvalido() {
        requestDto.setNivelBioincrustacao(5); // Nível inválido (> 4)

        assertThrows(IllegalArgumentException.class, () -> {
            relatorioService.criar(requestDto);
        });

        verify(relatorioRepository, never()).save(any());
    }

    @Test
    void testBuscarPorId_Sucesso() {
        when(relatorioRepository.findById(1L)).thenReturn(Optional.of(relatorio));

        RelatorioResponseDto response = relatorioService.buscarPorId(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("RAFAEL SANTOS", response.getNavioId());
        verify(relatorioRepository, times(1)).findById(1L);
    }

    @Test
    void testBuscarPorId_NaoEncontrado() {
        when(relatorioRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> {
            relatorioService.buscarPorId(999L);
        });

        verify(relatorioRepository, times(1)).findById(999L);
    }

    @Test
    void testAtualizarRelatorio_Sucesso() {
        when(relatorioRepository.findById(1L)).thenReturn(Optional.of(relatorio));
        when(relatorioRepository.save(any(Relatorio.class))).thenReturn(relatorio);

        requestDto.setTitulo("Título Atualizado");
        RelatorioResponseDto response = relatorioService.atualizar(1L, requestDto);

        assertNotNull(response);
        assertEquals("Título Atualizado", response.getTitulo());
        verify(relatorioRepository, times(1)).findById(1L);
        verify(relatorioRepository, times(1)).save(any(Relatorio.class));
    }

    @Test
    void testAtualizarRelatorio_NaoEncontrado() {
        when(relatorioRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> {
            relatorioService.atualizar(999L, requestDto);
        });

        verify(relatorioRepository, times(1)).findById(999L);
        verify(relatorioRepository, never()).save(any());
    }

    @Test
    void testListarPorNavio() {
        List<Relatorio> relatorios = Arrays.asList(relatorio);
        when(relatorioRepository.findByNavioIdOrderByDataRegistroDesc("RAFAEL SANTOS"))
            .thenReturn(relatorios);

        List<RelatorioResponseDto> response = relatorioService.listarPorNavio("RAFAEL SANTOS");

        assertNotNull(response);
        assertEquals(1, response.size());
        assertEquals("RAFAEL SANTOS", response.get(0).getNavioId());
        verify(relatorioRepository, times(1))
            .findByNavioIdOrderByDataRegistroDesc("RAFAEL SANTOS");
    }

    @Test
    void testDeletarRelatorio_Sucesso() {
        when(relatorioRepository.existsById(1L)).thenReturn(true);
        doNothing().when(relatorioRepository).deleteById(1L);

        relatorioService.deletar(1L);

        verify(relatorioRepository, times(1)).existsById(1L);
        verify(relatorioRepository, times(1)).deleteById(1L);
    }

    @Test
    void testDeletarRelatorio_NaoEncontrado() {
        when(relatorioRepository.existsById(999L)).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> {
            relatorioService.deletar(999L);
        });

        verify(relatorioRepository, times(1)).existsById(999L);
        verify(relatorioRepository, never()).deleteById(any());
    }

    @Test
    void testCriarRelatorioTipoLimpeza() {
        RelatorioRequestDto limpezaDto = new RelatorioRequestDto();
        limpezaDto.setNavioId("VICTOR OLIVEIRA");
        limpezaDto.setTipoRelatorio("LIMPEZA");
        limpezaDto.setTitulo("Limpeza Completa do Casco");
        limpezaDto.setTipoLimpeza("Completa");
        limpezaDto.setDataLimpeza(LocalDate.now());
        limpezaDto.setRegistradoPor("Maria Santos");

        Relatorio relatorioLimpeza = new Relatorio();
        relatorioLimpeza.setId(2L);
        relatorioLimpeza.setNavioId("VICTOR OLIVEIRA");
        relatorioLimpeza.setTipoRelatorio("LIMPEZA");
        relatorioLimpeza.setTitulo("Limpeza Completa do Casco");
        relatorioLimpeza.setTipoLimpeza("Completa");
        relatorioLimpeza.setDataLimpeza(LocalDate.now());
        relatorioLimpeza.setRegistradoPor("Maria Santos");
        relatorioLimpeza.setDataRegistro(LocalDateTime.now());
        relatorioLimpeza.setCreatedAt(LocalDateTime.now());
        relatorioLimpeza.setUpdatedAt(LocalDateTime.now());
        relatorioLimpeza.setStatus("FINALIZADO");
        relatorioLimpeza.setAnexos("[]");

        when(relatorioRepository.save(any(Relatorio.class))).thenReturn(relatorioLimpeza);

        RelatorioResponseDto response = relatorioService.criar(limpezaDto);

        assertNotNull(response);
        assertEquals("LIMPEZA", response.getTipoRelatorio());
        assertEquals("Completa", response.getTipoLimpeza());
        assertNotNull(response.getDataLimpeza());
    }
}

