# 🚢 Otimização Preditiva de Limpeza de Casco (HPI)

## 🌟 Visão Geral do Projeto

Este projeto implementa um modelo preditivo para calcular o **HPI (Hull Performance Index)** e sugerir a **Data Ideal de Limpeza** para cada navio da frota. O objetivo principal é transformar a manutenção reativa de cascos em um processo proativo e baseado no **Retorno sobre o Investimento (ROI)**, minimizando o Consumo Extra de Combustível causado pela bioincrustação.

### ✨ Valor Estratégico

1.  **Economia de Combustível:** Reduz o gasto excessivo ao intervir antes que a ineficiência se torne crítica.
2.  **Decisão Baseada em Dados:** Utiliza o HPI e o Consumo Extra para priorizar a manutenção mais rentável.
3.  **Planejamento Proativo:** Sugere a data ideal, facilitando a logística de *Dry Dock* e agendamento.

### 🛠️ Tecnologias Utilizadas

* **Backend:**
  - Java 17
  - Spring Boot 3.5.7
  - H2 Database (banco em memória/arquivo)
  - Apache Commons Math (para regressão linear)
  - Swagger/OpenAPI (documentação da API)

* **Modelo Analítico:**
  - Regressão Linear Múltipla (OLS - Ordinary Least Squares)
  - Feature Engineering personalizado
  - Cálculo dinâmico de HPI baseado em características do navio

* **Frontend:**
  - React 18.2
  - TypeScript 5.2
  - Tailwind CSS 3.3
  - Vite 5.0 (build tool e dev server)
  - Recharts 2.10 (gráficos)
  - Axios 1.6 (requisições HTTP)
  - React Router 6.20 (roteamento)
  - Lucide React (ícones)

* **Dados:**
  - Arquivos CSV históricos de eventos e consumo (`ResultadoQueryEventos.csv`)
  - Dados de docagem e revestimento
  - Informações de características dos navios

---

## 🚀 Como Iniciar o Projeto (Setup)

### 1. Pré-requisitos

#### Backend
* **JDK 17 ou superior** - Verifique com `java -version`
* **Maven 3.6+** - Verifique com `mvn -version`
* **IDE** (opcional, mas recomendado: IntelliJ IDEA, VS Code, Eclipse)

#### Frontend
* **Node.js 18+** - Verifique com `node -v`
* **npm 9+** ou **yarn** - Verifique com `npm -v`
* **Git** (para clonar o repositório)

### 2. Configuração do Backend

1.  **Clone o Repositório:**
    ```bash
    git clone git@github.com:marcleonio/hackathon-transpetro.git
    cd hackathon-transpetro
    ```

2.  **Base de Dados:**
    * O arquivo de dados **`ResultadoQueryEventos.csv`** (ou similar) deve estar localizado em `src/main/resources/data/`.
    * O banco de dados H2 será criado automaticamente na primeira execução em `./data/transpetro.mv.db`.

3.  **Compilação e Execução:**
    ```bash
    # Limpa, compila e empacota o projeto
    mvn clean install

    # Executa o projeto Spring Boot
    mvn spring-boot:run
    ```

    **Alternativa usando o wrapper Maven:**
    ```bash
    # No Windows
    ./mvnw.cmd spring-boot:run

    # No Linux/Mac
    ./mvnw spring-boot:run
    ```

4.  **Verificação:**
    * O backend estará acessível em `http://localhost:8080`
    * Acesse `http://localhost:8080/swagger-ui/index.html` para ver a documentação da API
    * Acesse `http://localhost:8080/h2-console` para o console do banco H2 (JDBC URL: `jdbc:h2:file:./data/transpetro`)

### 3. Configuração do Frontend

1.  **Navegue até a pasta do frontend:**
```bash
cd frontend
    ```

2.  **Instale as dependências:**
    ```bash
npm install
    ```

3.  **Configure variáveis de ambiente (opcional):**
    * Crie um arquivo `.env` na pasta `frontend/` se precisar alterar a URL da API:
    ```env
    VITE_API_URL=http://localhost:8080/api/v1
    ```
    * Por padrão, o frontend usa o proxy do Vite configurado em `vite.config.ts` que redireciona `/api` para `http://localhost:8080`.

4.  **Execute o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

5.  **Acesse o frontend:**
    * O frontend estará disponível em `http://localhost:3000` (ou outra porta se 3000 estiver ocupada)
    * O Vite mostrará a porta exata no terminal após iniciar

### 4. Executando o Projeto Completo

**Ordem recomendada de inicialização:**

1. **Primeiro, inicie o backend:**
   ```bash
   # No diretório raiz do projeto
   mvn spring-boot:run
   ```
   Aguarde até ver a mensagem: `Started TranspetroApplication`

2. **Depois, inicie o frontend:**
   ```bash
   # Em outro terminal, na pasta frontend
   cd frontend
npm run dev
```

3. **Acesse a aplicação:**
   - Frontend: `http://localhost:3000` (ou a porta indicada pelo Vite)
   - Backend API: `http://localhost:8080`
   - Swagger UI: `http://localhost:8080/swagger-ui/index.html`

### 5. Troubleshooting

#### Backend não inicia
- Verifique se a porta 8080 está livre: `lsof -i :8080` (Mac/Linux) ou `netstat -ano | findstr :8080` (Windows)
- Verifique se o JDK 17+ está instalado: `java -version`
- Verifique os logs no console para erros específicos

#### Frontend não conecta ao backend
- Certifique-se de que o backend está rodando em `http://localhost:8080`
- Verifique se há erros de CORS no console do navegador (F12)
- Verifique a configuração do proxy em `frontend/vite.config.ts`

#### Erro ao instalar dependências do frontend
- Limpe o cache do npm: `npm cache clean --force`
- Delete `node_modules` e `package-lock.json`, depois execute `npm install` novamente
- Verifique se está usando Node.js 18+: `node -v`

#### Dados não aparecem no dashboard
- Verifique se o backend está processando os dados corretamente (veja logs do Spring Boot)
- Verifique o console do navegador (F12) para erros de requisição
- Certifique-se de que há navios cadastrados no banco de dados ou que a lista hardcoded está sendo usada

---

## 📖 Documentação da API (Swagger/OpenAPI)

Após iniciar a aplicação, a documentação interativa da API estará disponível através do Swagger UI.

Acesse a URL no seu navegador para explorar todos os *endpoints* do `PredictionService`, incluindo os modelos de dados e a funcionalidade "Try it out".

**🔗 Link da Documentação:**
$$\mathbf{http://localhost:8080/swagger-ui/index.html}$$

*Nota: Se a aplicação estiver em um ambiente diferente, substitua `localhost:8080` pelo endereço e porta corretos.*

---

## 📂 Estrutura do Projeto e Localização dos Arquivos

| Componente | Localização | Descrição |
| :--- | :--- | :--- |
| **Modelo Analítico** | `src/main/java/.../service/ModelService.java` | Lógica de treino, Feature Engineering e aplicação do OLS. |
| **Frontend/Dashboard** | `frontend/src/` | Aplicação React com TypeScript, componentes e páginas. |
| **API REST (Endpoints)** | `src/main/java/.../controller/` | Controladores REST que expõem as funcionalidades. |

---

## 💻 Endpoints da API

### Previsão

| Método | URL | Descrição |
| :--- | :--- | :--- |
| **GET** | `/api/v1/previsao/limpeza-sugerida?navioId={ID}` | Retorna a projeção de HPI, Consumo Extra e a sugestão de limpeza para um navio específico. |

**Exemplo de Acesso:**
`http://localhost:8080/api/v1/previsao/limpeza-sugerida?navioId=Bruno%20Lima`

### CRUDs

- `GET /api/v1/navios` - Listar todos os navios
- `POST /api/v1/navios` - Criar navio
- `GET /api/v1/relatorios` - Listar relatórios
- `POST /api/v1/import/navios` - Importar CSV de navios

---

## 📈 Acesso ao Dashboard Visual

O dashboard de visualização da frota é a melhor forma de consumir a solução:

1.  **Certifique-se de que o backend está rodando** em `http://localhost:8080`.
2.  **Inicie o frontend** com `npm run dev` na pasta `frontend/`.
3.  **Acesse o dashboard** no navegador:
    ```
    http://localhost:3000
    ```
    *Nota: Se a porta 3000 estiver ocupada, o Vite usará automaticamente outra porta (ex: 3001, 3002, etc.). Verifique a porta exata no terminal onde o frontend está rodando.*

### Funcionalidades do Dashboard

- **Visão Geral da Frota:** Métricas agregadas (total de navios, navios críticos, navios limpos, consumo extra total)
- **Análise de Distribuição:** Gráficos de distribuição de navios por nível de bioincrustação
- **Detalhes por Navio:** Visualização individual com gráficos de projeção HPI, consumo extra e estimativa de comprometimento do casco
- **Filtros e Busca:** Filtragem por nível de bioincrustação e busca por nome do navio
- **Exportação:** Exportação de dados para CSV

O frontend fará requisições assíncronas para carregar o resumo de todos os navios e seus respectivos gráficos de projeção. Os dados são carregados em lotes para otimizar a performance.

---

## 🔬 O Coração da Análise: HPI e Consumo Extra

O modelo foi treinado em um **ambiente *pooled* (global)** usando os dados de toda a frota para determinar a taxa de degradação comum, mas aplica um **CFI Limpo (Consumo Ideal)** individualizado para o cálculo econômico de cada navio.

### 1. HPI (Hull Performance Index)

Métrica de performance baseada no consumo ideal de cada navio.

$$\mathbf{\text{HPI}} = \frac{\text{Consumo de Combustível Projetado}}{\text{Consumo de Combustível Limpo (Ideal)}}$$

* **HPI = 1.0:** Casco 100% eficiente (Linha de Base).
* **HPI > 1.0:** Representa o fator de ineficiência (arrasto).

### 2. Consumo Extra Atual ($\text{C}_{\text{Extra}}$)

Transforma a ineficiência do HPI em um custo diário e tangível.

$$\mathbf{\text{C}_{\text{Extra}}} = \mathbf{\text{CFI}_{\text{Limpo}}} \times (\mathbf{\text{HPI}} - 1.0)$$

Este é o valor em **Toneladas/Dia** que está sendo perdido devido à incrustação e que serve como base para o cálculo do **ROI da limpeza**.
- Calvin
