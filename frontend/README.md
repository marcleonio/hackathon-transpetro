# Frontend - Transpetro HPI Dashboard

Frontend moderno construído com React, TypeScript e Tailwind CSS para visualização do monitoramento preditivo de HPI (Hull Performance Index). Aplicação completa com design system da Petrobras, animações suaves e interface responsiva.

## 🏗️ Estrutura do Projeto

```
frontend/
├── src/
│   ├── components/      # Componentes React reutilizáveis
│   │   ├── layout/     # Componentes de layout (Sidebar, Header)
│   │   ├── widgets/    # Widgets do dashboard (FleetOverview, AnalyticsWidget, etc)
│   │   ├── cards/      # Cards específicos (ShipCard, FleetGrid, ShipListItem)
│   │   ├── modals/     # Modais (ShipModal)
│   │   └── ui/         # Componentes base (Card, Button, Badge, etc)
│   ├── hooks/          # Custom hooks
│   │   ├── useShips.ts      # Gerenciamento de dados dos navios
│   │   ├── useFilters.ts   # Filtros e busca
│   │   ├── useSidebar.ts   # Estado do sidebar
│   │   └── useAnimation.ts # Animações com intersection observer
│   ├── pages/          # Páginas da aplicação
│   │   ├── Dashboard.tsx       # Dashboard principal
│   │   ├── FleetPage.tsx       # Página de frota completa
│   │   ├── AnalyticsPage.tsx   # Página de análises
│   │   ├── ShipDetailPage.tsx  # Detalhes do navio
│   │   ├── ComparePage.tsx     # Comparação de navios
│   │   ├── PrioritiesPage.tsx  # Priorização de navios
│   │   └── SettingsPage.tsx    # Configurações
│   ├── service/        # Serviços de API
│   │   └── shipService.ts      # Serviço de API para navios
│   ├── types/          # Definições de tipos TypeScript
│   ├── utils/          # Funções utilitárias puras
│   │   ├── cn.ts              # Combinação de classes CSS
│   │   ├── constants.ts       # Constantes da aplicação
│   │   ├── dateUtils.ts       # Utilitários de data
│   │   ├── hpiUtils.ts        # Utilitários de HPI
│   │   ├── validation.ts      # Validação de dados
│   │   ├── economyUtils.ts    # Cálculos de custos
│   │   ├── exportUtils.ts     # Exportação de dados (CSV)
│   │   └── textUtils.ts       # Utilitários de texto
│   ├── App.tsx         # Componente raiz com rotas
│   ├── main.tsx        # Entry point
│   └── index.css       # Estilos globais e animações
└── package.json
```

## 🚀 Tecnologias

- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Estilização utilitária
- **Recharts** - Gráficos e visualizações
- **Axios** - Cliente HTTP com retry e batch processing
- **React Router DOM** - Roteamento
- **Lucide React** - Ícones modernos
- **date-fns** - Manipulação de datas

## 📦 Pré-requisitos

- **Node.js**: 18.x ou superior (recomendado: 18.18.0 ou LTS mais recente)
- **npm**: 9.x ou superior (vem com Node.js)

Para verificar sua versão:
```bash
node --version
npm --version
```

Se você usa `nvm` (Node Version Manager), o arquivo `.nvmrc` está configurado:
```bash
nvm use
```

## 📦 Instalação

```bash
cd frontend
npm install
```

## 🛠️ Desenvolvimento

```bash
npm run dev
```

O frontend estará disponível em `http://localhost:5173` (porta padrão do Vite)

## 🏗️ Build

```bash
npm run build
```

## 🔌 Integração com Backend

O frontend está configurado para se conectar ao backend Spring Boot na porta 8080. O proxy está configurado no `vite.config.ts` para redirecionar requisições `/api` para `http://localhost:8080`.

Para alterar a URL da API, crie um arquivo `.env`:

```env
VITE_API_URL=http://localhost:8080/api/v1
```

## 📁 Organização do Código

### Components

#### Layout (`components/layout/`)
- `Sidebar` - Menu lateral retrátil com navegação
- `Header` - Cabeçalho com busca e ações

#### Widgets (`components/widgets/`)
- `FleetOverview` - Visão geral da frota com métricas
- `AnalyticsWidget` - Widget de análises e distribuição
- `HPIChart` - Gráfico de projeção HPI (90 dias)
- `BiofoulingLevels` - Informações sobre níveis de bioincrustação
- `FilterPanel` - Painel de filtros por nível
- `RecentActivity` - Atividades recentes e alertas
- `StatsCard` - Card de estatísticas

#### Cards (`components/cards/`)
- `ShipCard` - Card individual de navio para grid
- `FleetGrid` - Grid responsivo de navios
- `ShipListItem` - Item de lista para visualização em lista

#### Modals (`components/modals/`)
- `ShipModal` - Modal de detalhes expandidos do navio

#### UI (`components/ui/`)
- `Card` - Container base com sombra e borda
- `Button` - Botão com variantes (default, primary, secondary, outline, ghost)
- `Badge` - Badge de status com variantes
- `StatusBadge` - Badge específico para níveis de bioincrustação
- `LoadingSpinner` - Spinner de carregamento
- `InfoTooltip` - Tooltip informativo com hover

### Hooks

Custom hooks para lógica reutilizável:
- `useShips` - Gerencia carregamento, estado e erros dos navios
- `useFilters` - Gerencia filtros, busca e ordenação
- `useSidebar` - Gerencia estado do sidebar (aberto/fechado, mobile/desktop)
- `useAnimation` - Hook para animações com intersection observer

### Service

Serviços de API e lógica de negócio:
- `shipService` - Serviço para operações com navios
  - Retry automático em caso de falhas
  - Batch processing para evitar sobrecarga do servidor
  - Tratamento de erros específico por tipo

### Utils

Funções utilitárias puras (sem dependências de React):
- `cn` - Combinação condicional de classes CSS (clsx + tailwind-merge)
- `dateUtils` - Formatação e manipulação de datas
- `hpiUtils` - Cálculos e utilitários de HPI (cores, progresso, etc)
- `validation` - Validação e sanitização de dados da API
- `constants` - Constantes da aplicação (níveis, limites, custos)
- `economyUtils` - Cálculos de custos e métricas financeiras
- `exportUtils` - Exportação de dados para CSV
- `textUtils` - Utilitários de manipulação de texto

## 🎨 Design System

O projeto segue o design system da Petrobras com:
- **Cores**: Paleta oficial (verde, amarelo, azul, branco)
- **Bordas**: Arredondamento consistente (rounded-lg, rounded-xl, rounded-2xl)
- **Tipografia**: Inter como fonte principal
- **Espaçamento**: Sistema de espaçamento consistente
- **Animações**: Transições suaves e animações de entrada (fadeInUp, slideIn, scaleIn)

### Componentes Customizados

Todos os componentes foram criados do zero, sem dependências de bibliotecas de UI:

- **Card** - Container com sombra, borda e hover effects
- **Badge** - Badge de status com variantes de cor
- **Button** - Botão com 5 variantes (default, primary, secondary, outline, ghost)
- **ShipCard** - Card específico para navios com gráfico HPI integrado
- **HPIChart** - Gráfico de linha para HPI usando Recharts com referências críticas
- **StatusBadge** - Badge de status de bioincrustação com ícones
- **LoadingSpinner** - Spinner de carregamento com cor da marca
- **InfoTooltip** - Tooltip informativo com hover para explicações de métricas

## 📊 Funcionalidades

### Páginas Principais

- **Dashboard** - Visão geral com métricas principais, navios em destaque, análises e atividades recentes
- **Frota** - Visualização completa da frota com grid/lista, filtros avançados e exportação CSV
- **Analíticas** - Análises detalhadas com gráficos interativos (distribuição, tendências, top navios)
- **Detalhes do Navio** - Página dedicada com abas (Overview, Notificações, Mensagens, Configurações)
- **Comparação** - Comparação lado a lado de até 3 navios com gráficos comparativos
- **Prioridades** - Lista priorizada de navios com base em HPI, custo e urgência
- **Configurações** - Configurações de perfil, notificações, segurança e dados

### Funcionalidades Técnicas

- ✅ **Roteamento** - Navegação completa com React Router DOM
- ✅ **Busca e Filtros** - Busca por nome e filtros por nível de bioincrustação
- ✅ **Visualizações** - Grid e lista para visualização da frota
- ✅ **Gráficos Interativos** - Projeção HPI, distribuição, tendências com Recharts
- ✅ **Exportação** - Exportação de dados para CSV
- ✅ **Animações** - Animações suaves de entrada e transições
- ✅ **Responsividade** - Design totalmente responsivo (mobile-first)
- ✅ **Sidebar Retrátil** - Menu lateral que se adapta a mobile e desktop
- ✅ **Tooltips Informativos** - Explicações de como as métricas são calculadas
- ✅ **Tratamento de Erros** - Mensagens específicas e retry automático
- ✅ **Batch Processing** - Carregamento em lotes para evitar sobrecarga
- ✅ **URL Encoding** - Tratamento correto de IDs com caracteres especiais

## 🧹 Clean Code

O projeto segue boas práticas de clean code e padrões sênior:

- ✅ **Separação de responsabilidades** - Estrutura modular por tipo (layout, widgets, cards, ui)
- ✅ **Funções puras e testáveis** - Utils sem dependências de React
- ✅ **Custom hooks** - Lógica reutilizável encapsulada
- ✅ **Tipagem TypeScript completa** - Tipos definidos para todas as entidades
- ✅ **Validação de dados** - Validação robusta de respostas da API
- ✅ **Tratamento de erros consistente** - Mensagens específicas por tipo de erro
- ✅ **Performance** - useMemo, useCallback, batch processing
- ✅ **Sem hardcode** - Constantes centralizadas
- ✅ **Sem logs desnecessários** - Código limpo sem console.log
- ✅ **Sem comentários desnecessários** - Código autoexplicativo
- ✅ **Estrutura escalável** - Fácil adicionar novos componentes e páginas

## 🎯 Métricas e Cálculos

### Custo Diário
Calculado como: `Consumo Extra Máx (Ton/dia) × R$ 800/Ton`

### Custo Projetado
Soma dos custos diários de consumo extra projetados para um período (30/60/90 dias), baseado nas previsões de HPI do modelo de regressão linear OLS.

### HPI (Hull Performance Index)
Índice calculado como: `Consumo Real / Consumo Ideal (CFI Limpo)`. Valores acima de 1.0 indicam ineficiência devido à bioincrustação.

### Priorização
Score combinado baseado em:
- HPI atual
- Custo diário
- Nível de urgência (bioincrustação)

## 🚀 Performance

- **Batch Processing**: Carregamento de navios em lotes de 5 com delay de 300ms
- **Retry Logic**: Até 3 tentativas automáticas em caso de falha
- **Timeout**: 60 segundos para requisições longas
- **Memoização**: Uso de useMemo e useCallback para otimização
- **Lazy Loading**: Componentes carregados sob demanda
