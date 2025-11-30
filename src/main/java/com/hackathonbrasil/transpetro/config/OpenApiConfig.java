package com.hackathonbrasil.transpetro.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("API Transpetro - Sistema de Gestão de Navios")
                        .version("1.0.0")
                        .description("""
                                API completa para gestão e monitoramento de navios da frota Transpetro.
                                
                                ## Funcionalidades:
                                - **Previsão de Limpeza**: Modelo preditivo para calcular HPI e sugerir data ideal de docagem
                                - **Relatórios de Marinheiros**: CRUD completo para registro de inspeções, limpezas e observações
                                
                                ## Endpoints Principais:
                                - `/api/v1/previsao` - Previsões de limpeza e HPI
                                - `/api/v1/relatorios` - Gestão de relatórios dos marinheiros
                                
                                ## Tipos de Relatórios:
                                - **INSPECAO**: Inspeção visual do casco (com nível de bioincrustação 0-4)
                                - **LIMPEZA**: Relatório de limpeza realizada (Parcial, Completa, Em Docagem)
                                - **OBSERVACAO**: Observações gerais sobre condições do navio
                                - **CONSUMO**: Observações sobre consumo anormal de combustível
                                """)
                        .contact(new Contact()
                                .name("Equipe Transpetro")
                                .email("suporte@transpetro.com.br"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0.html")));
    }
}

