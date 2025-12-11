# EcoEnergy - Sistema de Conscientização Energética

Sistema completo para monitoramento e controle de consumo de energia elétrica.

## Funcionalidades

- ✅ Autenticação de usuários (Login/Registro)
- ✅ Cadastro de aparelhos elétricos
- ✅ Registro diário de uso
- ✅ Cronômetro para aparelhos de uso rápido
- ✅ Relatórios de consumo (diário, semanal, mensal)
- ✅ Dicas personalizadas de economia
- ✅ Configuração de tarifa de energia
- ✅ Perfil de usuário com foto

## Como Instalar e Rodar

### 1. Instalar Dependências
\`\`\`bash
npm install
\`\`\`

### 2. Rodar o Projeto
\`\`\`bash
npm run dev
\`\`\`

### 3. Acessar no Navegador
Abra: `http://localhost:3000`

## Estrutura do Projeto

\`\`\`
app/
├── page.tsx              # Página principal (calculadora)
├── login/page.tsx        # Página de login/registro
├── account/page.tsx      # Perfil do usuário
├── api/auth/            # APIs de autenticação
└── globals.css          # Estilos globais

contexts/
└── auth-context.tsx     # Gerenciamento de autenticação

components/
└── ui/                  # Componentes reutilizáveis

lib/
├── utils.ts             # Utilitários
└── api.ts              # Interceptor de API
\`\`\`

## Tecnologias

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui

## Créditos

Desenvolvido para EETEPA Oriximiná
