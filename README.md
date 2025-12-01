# 🚢 Otimização Preditiva de Limpeza de Casco (HPI)

## 🌟 Visão Geral do Projeto

Este projeto implementa um modelo preditivo para calcular o **HPI (Hull Performance Index)** e sugerir a **Data Ideal de Limpeza** para cada navio da frota. O objetivo principal é transformar a manutenção reativa de cascos em um processo proativo e baseado no **Retorno sobre o Investimento (ROI)**, minimizando o Consumo Extra de Combustível causado pela bioincrustação.

### ✨ Valor Estratégico

1.  **Economia de Combustível:** Reduz o gasto excessivo ao intervir antes que a ineficiência se torne crítica.
2.  **Decisão Baseada em Dados:** Utiliza o HPI e o Consumo Extra para priorizar a manutenção mais rentável.
3.  **Planejamento Proativo:** Sugere a data ideal, facilitando a logística de *Dry Dock* e agendamento.

### 🛠️ Tecnologias Utilizadas

* **Backend:** Java, Spring Boot, H2 Database
* **Modelo Analítico:** Regressão Linear Múltipla (OLS)
* **Frontend:** React 18, TypeScript, Tailwind CSS, Vite
* **Dados:** Arquivos CSV históricos de eventos e consumo (`ResultadoQueryEventos.csv`).

---

## 🚀 Como Iniciar o Projeto (Setup)

### 1. Pré-requisitos

Certifique-se de que os seguintes softwares estão instalados em seu ambiente:

* **JDK 17 ou superior**
* **Maven** (para gerenciamento de dependências e build)
* **IDE** (IntelliJ IDEA, VS Code, Eclipse)

### 2. Configuração do Ambiente

1.  **Clone o Repositório:**
    ```bash
    git clone git@github.com:marcleonio/hackathon-transpetro.git
    cd hackathon-transpetro
    ```

2.  **Base de Dados:**
    * O arquivo de dados **`ResultadoQueryEventos.csv`** (ou similar) deve estar localizado em `src/main/resources/data/`.

3.  **Compilação e Execução (Via Maven):**
    ```bash
    # Limpa, compila e empacota o projeto
    mvn clean install

    # Executa o projeto Spring Boot
    mvn spring-boot:run
    ```

O backend estará acessível em `http://localhost:8080`.

### 3. Frontend

```bash
# 1. Entrar na pasta do frontend
cd frontend

# 2. Instalar dependências
npm install

# 3. Executar o servidor de desenvolvimento
npm run dev
```

O frontend estará disponível em `http://localhost:5173`

**Pré-requisitos do Frontend:**
- Node.js 18+ e npm 9+

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

1.  Certifique-se de que o backend está rodando em `http://localhost:8080`.
2.  Inicie o frontend com `npm run dev` na pasta `frontend/`.
3.  Abra o seguinte link no seu navegador:
    ```
    http://localhost:5173
    ```
O frontend fará requisições assíncronas para carregar o resumo de todos os navios e seus respectivos gráficos de projeção.

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
