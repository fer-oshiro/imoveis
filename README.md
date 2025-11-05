# Imovel - Gerenciamento dos Imoveis e Lading Page

## 🚧 Em desenvolvimento 🚧

Plataforma pessoal desenvolvida para gerenciar imóveis, inquilinos e pagamentos, com arquitetura moderna baseada em **SST (Serverless Stack)**, **AWS Lambda** e **DynamoDB**.  
O projeto combina **infraestrutura serverless**, **front-end em Next.js**

## Objetivo

O projeto foi criado com propósito de estudo e demonstração prática de domínio técnico em:

- Arquitetura **serverless** com AWS.
- Integração entre **backend e frontend** em um monorepo.
- Modelagem de dados com **DynamoDB (single-table design)**.
- Automação e boas práticas de desenvolvimento com **TypeScript**, **Zod** e **Prisma/Drizzle** (para testes e validações).

Este projeto é de **caráter pessoal**, criado para fins de portfólio e aprendizado.

## Tecnologias Utilizadas

### Backend

- **SST (Serverless Stack)** – infraestrutura e deploy AWS.
- **AWS Lambda** – funções serverless.
- **AWS DynamoDB** – armazenamento NoSQL.
- **AWS S3** – armazenamento de arquivos (contratos, comprovantes, etc).
- **AWS SES** – envio e recebimento de e-mails.
- **TypeScript** – linguagem principal.
- **Zod** – validação de dados.
- **Drizzle** – ORM TypeScript sem interface gráfica
- **Fastify** – camada de roteamento.

### Frontend

- **Next.js** – interface principal.
- **Tailwind CSS** + **ShadCN/UI** – componentes e estilização.

---

## Estrutura do Projeto

```
imovel/
├── apps/
│   ├── api/          # API HTTP REST
│   ├── web/          # Next.js (interface pública/admin)
│   └── workers/      # Lambdas assíncronas: cron, S3, filas, etc
├── packages/
│   ├── core/         # Domínio: entidades, VOs, casos de uso, regras de negócio
│   ├── data-access/  # Repositórios DynamoDB, gateways S3/SES, etc
│   └── shared/       # Tipos, DTOs, Zod schemas compartilhados
├── infra/            # Stacks do SST (Infra AWS)
├── docs/             # Diagramas, Draw.io, notas técnicas
└── README.md
```

## Funcionalidades principais

- Cadastro e listagem de imóveis (kitnets, apartamentos, galpões).
- Associação de imóveis a inquilinos e contratos de aluguel.
- Registro de pagamentos com status (pendente, pago, atrasado).
- Upload de comprovantes em S3.
- Visualização em tabela com filtros por status e localização.
- Modelagem de dados em uma única tabela DynamoDB (single-table design).

## Como rodar o projeto localmente

### Pré-requisitos

- Node.js 22+
- npm 11+
- Conta AWS configurada (credenciais com acesso mínimo para DynamoDB, S3 etc.)
- SST v3

### Passos

```bash
# Instalar dependências na raiz do monorepo
npm install

# Subir infraestrutura e Lambdas em modo dev
npm run dev
```
