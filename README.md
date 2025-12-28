# MZ Parts Manager

**MZ Parts Manager** é um sistema de gestão (ERP/SaaS) focado em **lojas de peças automotivas, agrícolas e mecânicas**, desenvolvido para resolver um dos maiores gargalos do setor: **organização, busca e padronização de itens**.

O projeto nasce da operação real de uma loja física e evolui como uma plataforma moderna, multiempresa e colaborativa.

---

## 🎯 Objetivo do Projeto

Criar um sistema simples, rápido e inteligente que permita:

- Gerenciar estoque, vendas e compras
- Padronizar descrições de itens
- Facilitar a busca de peças mesmo com descrições diferentes
- Conectar conhecimento técnico (tags, aplicações, conversões)
- Evoluir para uma base compartilhada de dados entre empresas

Inspirado por soluções como ERPs tradicionais, iFixit e plataformas colaborativas, o MZ Parts Manager busca **unir o mundo físico das peças com o digital**.

---

## 🚀 Principais Funcionalidades

### 🔹 Gestão de Itens
- Descrição livre por empresa
- Tags personalizadas
- Aplicações (veículos, máquinas, usos)
- Conversões (códigos equivalentes, referências)

### 🔹 Estrutura Global + Local
- **Itens locais** pertencem à empresa
- **GlobalItem** permite normalização e compartilhamento inteligente no futuro
- Preparado para evolução colaborativa entre empresas

### 🔹 Multiempresa (Multi-Tenant)
- Cada usuário pertence a uma empresa
- Isolamento de dados por empresa
- Arquitetura preparada para escalar como SaaS

### 🔹 API REST
- Backend em Django + Django REST Framework
- Frontend desacoplado (React)
- Comunicação via API

---

## 🧠 Conceitos Importantes

- **Item**: item específico da empresa
- **GlobalItem**: entidade global que representa um item padronizado
- **Tags**: características técnicas ou comerciais
- **Applications**: onde a peça é aplicada
- **Conversions**: equivalências de códigos ou modelos

Esses conceitos permitem que o sistema evolua para algo muito além de um ERP comum.

---

## 🛠️ Tecnologias Utilizadas

### Backend
- Python
- Django
- Django REST Framework
- PostgreSQL
- Arquitetura modular por apps

### Frontend
- React
- Vite
- Material UI (MUI)
- Axios

---

## 📁 Estrutura do Projeto (Simplificada)

backend/
apps/
accounts
catalog
multicompany
stock
sales
nfe
frontend/
src/
pages
components
services


---

## ⚙️ Status do Projeto

🚧 **Em desenvolvimento ativo**

O sistema está sendo:
- Testado em ambiente real (loja física)
- Refinado do ponto de vista técnico e de usabilidade
- Evoluído passo a passo com foco em base sólida

---

## 🔮 Visão de Futuro

- Base colaborativa de conhecimento sobre peças
- Busca inteligente por equivalência
- Compartilhamento opcional de dados entre empresas
- Marketplace de peças e ferramentas
- Plataforma aberta para melhorias da comunidade

---

## 🤝 Contribuições

Este projeto está em fase inicial, mas contribuições serão bem-vindas no futuro.

Sugestões, ideias e discussões são incentivadas.

---

## 👤 Autor

**Adalton Muzilo Mendes**  
Empreendedor, desenvolvedor e criador do MZ Parts Manager.

Projeto criado a partir de um problema real do mercado e desenvolvido com foco em longo prazo.

---

## 📜 Licença

Este projeto ainda não possui licença definida.
