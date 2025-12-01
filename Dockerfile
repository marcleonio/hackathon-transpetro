# ===============================================
# STAGE 1: CONSTRUÇÃO DO FRONTEND (REACT)
# ===============================================
FROM node:18-alpine AS frontend-builder

# Define o diretório de trabalho para a aplicação React
WORKDIR /app/frontend

# Copia os arquivos de dependência do React
COPY frontend/package*.json ./

# Instala as dependências do React
RUN npm install

# Copia o código fonte do React
COPY frontend/ ./

# Constrói a aplicação React (gera arquivos estáticos na pasta 'dist')
# O Render CLI ou a sua configuração de build podem estar esperando 'dist' ao invés de 'build'.
# Verifique o seu package.json para confirmar a pasta de saída (geralmente 'dist' para Vite/Vue/modern frameworks, ou 'build' para React padrão).
# Assumindo que o comando 'npm run build' gera a pasta 'dist', conforme o COPY seguinte.
RUN npm run build

# ===============================================
# STAGE 2: CONSTRUÇÃO DO BACKEND (SPRING BOOT com Maven)
# ===============================================
# Usando a imagem Maven com JDK 17 para o processo de build
FROM maven:3.8.5-openjdk-17 AS backend-builder

# Define o diretório de trabalho no contêiner
WORKDIR /app

# CORREÇÃO: Copia todo o contexto de build para o diretório de trabalho /app.
# Isso garante que a estrutura multi-módulo (pom.xml principal e a pasta do módulo)
# seja preservada e o Maven encontre o projeto corretamente.
COPY . .

# --- Integração Frontend no Backend ---
# A pasta de recursos estáticos do Spring Boot
RUN mkdir -p hackathon-transpetro-backend/src/main/resources/static

# Copia os arquivos estáticos construídos pelo React para a pasta de recursos estáticos do Spring Boot
# Note que a pasta de origem no frontend foi alterada para 'dist', que é o output comum para npm build.
COPY --from=frontend-builder /app/frontend/dist ./hackathon-transpetro-backend/src/main/resources/static

# Constrói o JAR final do Spring Boot (com os arquivos do React dentro)
# Este comando agora deve funcionar, pois a estrutura de pastas do Maven está correta.
RUN mvn clean install -DskipTests

# REMOVIDO: ARG JAR_FILE não é mais necessário, pois usaremos um wildcard no COPY.

# ===============================================
# STAGE 3: IMAGEM FINAL DE EXECUÇÃO
# ===============================================
# Usando a imagem JRE (Java Runtime Environment) mais leve para a execução
FROM openjdk:17.0.1-jdk-slim

# Define o diretório de trabalho
WORKDIR /app

# Copia o JAR construído da Stage 2 para a imagem final
# CORREÇÃO: Removemos o subdiretório do módulo ('hackathon-transpetro-backend') do caminho de origem do JAR,
# presumindo que o JAR é criado em '/app/target' porque a compilação ocorreu no WORKDIR /app.
COPY --from=backend-builder /app/target/*.jar app.jar

# O Render espera que a aplicação escute na porta 10000
EXPOSE 10000

# Comando para iniciar a aplicação
CMD ["java", "-jar", "app.jar"]