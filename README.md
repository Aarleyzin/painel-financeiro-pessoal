# Painel Financeiro Pessoal

Painel pessoal para organizar receitas, despesas, categorias e limites em um dashboard visual, minimalista e direto.

## Destaques

- autenticação de usuário com sessão persistida
- CRUD de receitas, despesas, categorias e limites mensais
- dashboard com visão consolidada de saldo, entradas e saídas
- landing page pensada para apresentação em portfólio
- base pronta para recorrências, metas e análises inteligentes
- arquitetura separada entre frontend, API e camada compartilhada

## Preview

O Painel Financeiro Pessoal foi pensado como uma aplicação com cara de produto real:

- landing page com proposta clara do projeto
- tela de login e cadastro
- painel com resumo financeiro e gráficos
- formulário para movimentações
- gestão de categorias
- gestão de limites por mês

## Estrutura

```text
painel-pessoal-financeiro/
├─ apps/
│  ├─ web/        # React + Tailwind
│  └─ api/        # Node.js + Express
├─ packages/
│  └─ shared/     # Tipos compartilhados
├─ docs/          # Documentação do produto e da arquitetura
└─ infra/         # Arquivos de suporte para deploy e ambiente
```

## MVP

- autenticação de usuário
- dashboard com resumo financeiro
- cadastro de receitas e despesas
- categorias
- filtro por período
- gráficos de entrada x saída
- limites mensais por categoria
- persistência em banco

## Stack

- Frontend: React + Tailwind
- Backend: Node.js + Express
- Banco: Prisma com SQLite no desenvolvimento
- Auth: JWT
- Gráficos: Recharts
- Deploy: auto-hospedagem (Render/Railway/Fly/etc.)

## Link do repositório

- [GitHub público](https://github.com/Aarleyzin/painel-pessoal-financeiro)

## Como rodar

1. Copie `.env.example` para `.env` e preencha `JWT_SECRET` e `DATABASE_URL` (PostgreSQL).
2. Rode:

```bash
pnpm install
pnpm db:generate
pnpm db:migrate        # ou pnpm db:push para ambiente local sem histórico
pnpm db:seed
pnpm dev
```

## Conta de acesso

Nenhuma credencial fica no repositório. A conta pessoal é criada a partir de
variáveis de ambiente, definidas apenas no seu ambiente/hospedagem:

- `OWNER_NAME`, `OWNER_EMAIL` e `OWNER_PASSWORD`

Se `OWNER_PASSWORD` não estiver definido, nenhuma conta é semeada. Você também
pode criar sua conta diretamente em `/register`.

## Capturas sugeridas

Se você quiser adicionar imagens no GitHub ou no LinkedIn, os melhores prints são:

- `/` com a landing page
- `/login`
- `/register`
- `/dashboard`
- `/transactions`
- `/categories`
- `/budgets`

## Próximos passos

- publicar frontend e API em ambiente online
- incluir screenshots do dashboard no README
- adicionar seed com cenários extras para demonstração e múltiplos usuários

## Observação

O dashboard inicial usa alguns dados mockados na interface, enquanto as telas de
receitas, despesas, categorias e limites já conversam com a API real.

Para produção, use PostgreSQL no `DATABASE_URL` (SQLite é apenas para desenvolvimento local).

## Deploy no Render (infra como código)

- Arquivo `render.yaml` pronto com dois serviços:
  - `finpilot-api` (web service Node): usa `DATABASE_URL` (Postgres) e `JWT_SECRET`.
  - `finpilot-web` (static): publica `apps/web/dist` e lê `VITE_API_URL` (padrão aponta para `https://finpilot-api-ng5i.onrender.com`).
- Passos:
  1. No Render, “New +” → “Blueprint” → aponte para este repositório.
  2. Defina as envs `DATABASE_URL` e `JWT_SECRET` no serviço `finpilot-api`.
  3. Deploy; o front já sairá apontando para o host da API (ajuste `VITE_API_URL` se necessário).
