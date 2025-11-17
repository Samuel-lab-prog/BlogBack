# Checklist de Profissionalização do Projeto (Blog Fullstack)

Este checklist acompanha a evolução do projeto rumo a um nível profissional, cobrindo backend, frontend, segurança, testes, CI/CD e boas práticas.

---

## **Nível 1 — Projeto Funcional**

> Objetivo: App funcionando de ponta a ponta.

- [x] Estrutura MVC organizada
- [x] CRUD completo de usuários
- [x] CRUD completo de posts
- [x] Autenticação com JWT
- [x] Hash de senha com bcrypt
- [x] Banco PostgreSQL com Pool
- [x] Frontend consumindo a API
- [x] Deploy backend no Render
- [x] Deploy frontend (Render ou Vercel)
- [x] Variáveis de ambiente (.env)

---

## **Nível 2 — Projeto Profissional**

> Objetivo: qualidade, padronização e confiabilidade.

### **Testes**

- [x] Testes unitários do model
- [x] Testes unitários do controller
- [x] Script "test": "bun test"
- [x] Testes rodando em ambiente NODE_ENV=test
- [x] Cobertura de testes (bun test --coverage)
- [x] Testes automáticos no GitHub Actions

### **Backend**

- [x] Middleware global de erros (AppError)
- [ ] Logger (Winston / Pino)
- [x] Helmet + rate limiting
- [x] Sanitização de dados (xss-clean, etc.)
- [ ] Logs de requisição (status, tempo, IP)
- [x] .env.dev, .env.test, .env.prod separados

### **Documentação**

- [x] Swagger (OpenAPI) para todos os endpoints
- [x] README completo com instruções
- [ ] Coleção do Postman exportada
- [ ] Diagrama da arquitetura

### **Banco de Dados**

- [x] Tabelas normalizadas
- [x] Scripts SQL versionados
- [x] Migrações (manual ou via Prisma/Drizzle)
- [ ] Backup automático
- [ ] Script de reset de DB para testes

---

## **Nível 3 — Portfólio Forte**

> Objetivo: mostrar maturidade técnica.

### **DevOps**

- [ ] Dockerfile para backend
- [ ] docker-compose para backend + banco
- [x] CI/CD com testes + deploy automático
- [ ] Health check configurado
- [ ] Logs centralizados (Logtail / Papertrail)

### **Frontend**

- [x] Páginas de erro (404, 500)
- [x] Tratamento de erros do backend
- [x] Painel administrativo funcional
- [ ] Tema dark/light
- [ ] UX refinada (feedbacks, toasts, loaders)

### **Segurança**

- [x] Cookies HTTPOnly opcionais
- [ ] Refresh token ou token com expiração curta
- [ ] Recuperação de senha (simulado ou real)

---

## **Nível 4 — Projeto Destaque**

> Objetivo: ir além do comum — nível de dev contratado.

### **Tecnologias avançadas**

- [ ] Prisma ORM (tipagem + migrações automáticas)
- [ ] Redis para cache
- [ ] Uploads (Cloudinary/S3)
- [ ] Filas (BullMQ)

### **Qualidade de código**

- [ ] Testes de integração (Supertest)
- [ ] Testes E2E (Cypress / Playwright)
- [ ] Cobertura > 80%
- [x] ESLint + Prettier
- [ ] Husky (lint e testes antes de commits)

### **Demonstração**

- [ ] README com badges (build passing, coverage)
- [ ] Vídeo curto mostrando o funcionamento
- [ ] Deploy com usuário demo

---
