# Saldo — Painel Financeiro Pessoal

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
- Deploy do front: GitHub Pages (workflow em `.github/workflows/deploy-pages.yml`)

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

## Deploy do front (GitHub Pages)

- O workflow `.github/workflows/deploy-pages.yml` builda `apps/web` e publica no GitHub Pages a cada push na `main`.
- Passos:
  1. Em **Settings → Pages**, defina **Source: GitHub Actions**.
  2. (Opcional) Crie a variável de repositório `VITE_API_URL` apontando para a sua API.
  3. Ao mesclar na `main`, o site publica em `https://<seu-usuario>.github.io/<repositorio>/`.

> A API (Node/Express) pode ser hospedada onde você preferir; basta apontar `VITE_API_URL` para ela.
