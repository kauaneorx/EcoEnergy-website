# Sistema Backend EcoEnergy

Este projeto utiliza um backend completo em JavaScript/TypeScript usando Next.js Route Handlers e armazenamento em arquivos JSON.

## Estrutura do Backend

### Banco de Dados (`lib/db.ts`)
Sistema de persistência usando arquivos JSON na pasta `/data`:
- `users.json` - Dados dos usuários
- `appliances.json` - Aparelhos cadastrados
- `records.json` - Registros diários de consumo
- `settings.json` - Configurações de tarifa

### Autenticação (`lib/auth.ts`)
- Sistema de tokens baseado em cookies
- Funções para obter usuário atual
- Proteção de rotas

## APIs Disponíveis

### Autenticação
- `POST /api/auth/register` - Criar nova conta
- `POST /api/auth/login` - Fazer login
- `GET /api/auth/me` - Obter usuário atual
- `POST /api/auth/logout` - Fazer logout

### Perfil de Usuário
- `GET /api/user/profile` - Obter perfil
- `PUT /api/user/profile` - Atualizar perfil (nome, email, telefone, foto)
- `PUT /api/user/password` - Alterar senha

### Aparelhos
- `GET /api/appliances` - Listar aparelhos do usuário
- `POST /api/appliances` - Criar novo aparelho
- `PUT /api/appliances/[id]` - Atualizar aparelho
- `DELETE /api/appliances/[id]` - Deletar aparelho

### Registros de Consumo
- `GET /api/records` - Listar registros (com filtro de data)
- `POST /api/records` - Criar novo registro
- `PUT /api/records/[id]` - Atualizar registro
- `DELETE /api/records/[id]` - Deletar registro

### Configurações
- `GET /api/settings` - Obter configurações (tarifa)
- `PUT /api/settings` - Atualizar tarifa

## Segurança

Todas as APIs (exceto login e register) requerem autenticação via cookie.

### Em Produção
Para uso em produção, recomenda-se:
1. Substituir o sistema de arquivos por banco de dados real (PostgreSQL, MongoDB)
2. Usar hash de senha (bcrypt)
3. Implementar JWT com refresh tokens
4. Adicionar rate limiting
5. Validação de inputs mais robusta

## Como Funciona

1. Usuário faz login → recebe token no cookie
2. Token é enviado automaticamente em cada requisição
3. Backend valida token e identifica usuário
4. Dados são salvos/lidos dos arquivos JSON na pasta `/data`
5. Cada usuário só acessa seus próprios dados

## Migração para Banco de Dados

O código está estruturado para fácil migração. Basta substituir as funções em `lib/db.ts` por queries de banco de dados real (SQL, MongoDB, etc.) mantendo as mesmas interfaces.
