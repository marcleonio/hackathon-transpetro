# ===============================================
# STAGE 1: CONSTRUÇÃO DO FRONTEND (REACT)
# ===============================================
FROM node:18-alpine AS frontend-builder

# Define o diretório de trabalho para a aplicação React
WORKDIR /app/frontend

# Copia os arquivos de dependência do React
# A pasta do frontend é frontend
COPY frontend/package*.json ./

# Instala as dependências do React
RUN npm install

# Copia o código fonte do React
COPY frontend/ ./

# Constrói a aplicação React (gera arquivos estáticos na pasta 'build')
RUN npm run build

# ===============================================
# STAGE 2: CONSTRUÇÃO DO BACKEND (SPRING BOOT com Maven)
# ===============================================
# Usando a imagem Maven com JDK 17 para o processo de build
FROM maven:3.8.5-openjdk-17 AS backend-builder

# Define o diretório de trabalho no contêiner
WORKDIR /app

# Copia o pom.xml principal do projeto (multi-módulo)
COPY pom.xml ./

# Copia o código fonte do backend
COPY ./ ./hackathon-transpetro-backend/

# --- Integração Frontend no Backend ---
# Cria a pasta estática dentro do projeto Spring Boot
RUN mkdir -p hackathon-transpetro-backend/src/main/resources/static

# Copia os arquivos estáticos construídos pelo React para a pasta de recursos estáticos do Spring Boot
COPY --from=frontend-builder /app/frontend/dist ./hackathon-transpetro-backend/src/main/resources/static

# Constrói o JAR final do Spring Boot (com os arquivos do React dentro)
RUN mvn clean install -DskipTests

# Define o nome do arquivo JAR que será gerado pelo Maven.
# Você pode precisar ajustar a versão (ex: 0.0.1-SNAPSHOT) se for diferente no seu pom.xml do backend.
# Aconselho a verificar o nome exato no seu pom.xml.
ARG JAR_FILE=hackathon-transpetro-backend/target/transpetro-0.0.1-SNAPSHOT.jar

# ===============================================
# STAGE 3: IMAGEM FINAL DE EXECUÇÃO
# ===============================================
# Usando a imagem JRE (Java Runtime Environment) mais leve para a execução
FROM openjdk:17.0.1-jdk-slim

# Define o diretório de trabalho
WORKDIR /app

# Copia o JAR construído da Stage 2 para a imagem final
COPY --from=backend-builder ${JAR_FILE} app.jar

# O Render espera que a aplicação escute na porta 10000
EXPOSE 10000

# Comando para iniciar a aplicação
# O Spring Boot detecta automaticamente a variável de ambiente $PORT do Render
# (que é 10000) e configura a porta do servidor.
CMD ["java", "-jar", "app.jar"]