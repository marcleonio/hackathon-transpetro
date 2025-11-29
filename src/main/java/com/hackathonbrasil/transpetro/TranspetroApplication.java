package com.hackathonbrasil.transpetro;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.hackathonbrasil.transpetro.service.ModelService; // Importação CORRETA

@SpringBootApplication
public class TranspetroApplication {

    // Injetamos apenas o ModelService, que agora orquestra tudo.
    @Autowired
    private ModelService modelService; // Usando a classe ModelService que acabamos de construir

    public static void main(String[] args) {
        SpringApplication.run(TranspetroApplication.class, args);
    }

    /**
     * O CommandLineRunner agora tem apenas uma responsabilidade:
     * Iniciar o pipeline de dados e treinamento no ModelService.
     */
    @Bean
    public CommandLineRunner initDataAndTrainModel() {
        return args -> {
            System.out.println("--- INICIANDO PIPELINE DE DADOS ---");

            // AQUI ESTÁ A MUDANÇA: Uma única chamada orquestra:
            // 1. Leitura de Consumo/Eventos
            // 2. Leitura de Docagem (Limpeza 100%)
            // 3. Consolidação (JOIN)
            // 4. Feature Engineering (Cálculo HPI e Dias Desde Limpeza)
            // 5. Treinamento da Regressão
            modelService.initDataAndTrainModel();

            System.out.println("--- PIPELINE CONCLUÍDO. MODELO TREINADO E PRONTO PARA PREDIÇÃO ---");
        };
    }
}