# Frontend - SELIC Dashboard

Interface moderna para visualização e gerenciamento do sistema de otimização de limpeza de casco.

## 🚀 Início Rápido

```bash
# 1. Instalar dependências
npm install

# 2. Executar servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

## 📋 Pré-requisitos

- **Node.js 18+** (recomendado: 18.18.0 ou LTS)
- **npm 9+**

Verificar versões:
```bash
node --version
npm --version
```

## 🛠️ Comandos

```bash
npm install      # Instalar dependências
npm run dev      # Servidor de desenvolvimento
npm run build    # Build para produção
npm run preview  # Preview do build
```

## 🔌 Configuração da API

O frontend está configurado para conectar ao backend em `http://localhost:8080`.

Para alterar, crie um arquivo `.env`:

```env
VITE_API_URL=http://localhost:8080/api/v1
```

## 📁 Estrutura

```
src/
├── components/     # Componentes React
│   ├── layout/     # Sidebar, Header
│   ├── widgets/    # Widgets do dashboard
│   ├── cards/      # Cards de navios
│   ├── modals/     # Modais
│   └── ui/         # Componentes base
├── pages/          # Páginas da aplicação
├── hooks/          # Custom hooks
├── service/        # Serviços de API
├── types/          # Tipos TypeScript
└── utils/          # Funções utilitárias
```

## 🎨 Tecnologias

- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool
- **Tailwind CSS** - Estilização
- **Recharts** - Gráficos
- **React Router** - Roteamento
- **Axios** - Cliente HTTP

## 📄 Páginas Principais

- **Dashboard** (`/`) - Visão geral da frota
- **Frota** (`/fleet`) - Lista completa de navios
- **Analíticas** (`/analytics`) - Análises e gráficos
- **Navios** (`/navios`) - Gerenciamento de navios
- **Relatórios** (`/relatorios`) - Sistema de relatórios
- **Configurações** (`/settings`) - Configurações e importação

## 🎯 Funcionalidades

- ✅ Dashboard interativo com métricas HPI
- ✅ Visualização em grid e lista
- ✅ Busca e filtros avançados
- ✅ Gráficos de projeção HPI
- ✅ CRUD completo de navios
- ✅ Sistema de relatórios
- ✅ Importação de CSV
- ✅ Design responsivo
- ✅ Modais funcionais
