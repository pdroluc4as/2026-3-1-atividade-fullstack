# 2026.3.1 - POS - Frondend web e Backend api restfull

## Informações gerais

- **Público alvo**: alunos da disciplina de **Programação orientada a serviços** do curso de [Infoweb](https://diatinf.ifrn.edu.br/cursos/tecnico-em-informatica-para-internet/) na [DIATINF](https://diatinf.ifrn.edu.br/) no [CNAT-IFRN](https://portal.ifrn.edu.br/campus/natalcentral/)
- **Professor**: [L A Minora](https://github.com/leonardo-minora/)
- **Objetivo**:
  1. Atividade avaliativa para construção de aplicativo com frontend web e backend api restfull

[A descrição da atividade](atividade.md)

---

Pedro Lucas Oliveira de Sousa  
[github](https://github.com/pdroluc4as)


## Relato da atividade
Atividade feita utilizando IA vibe coding, foi rapido de fazer mas acredito que o sistema necessita de melhorias. Passei grande parte do tempo resolvendo bugs também.

### Componentes e tecnologias

quais tecnologia utilizdas?  
backend: nestjs  
frontend: nextjs  
drizzle ORM  
sqlite  
API de imagens DiceBear

### Agente de IA

Qual e como utilizou a IA?

#### Gemini

- Pesquisa e recomendação de codigo

#### compilot

- escrita, analise e automação de codigo

#### stitch

- criação das interfaces e prototipos

### Execução do projeto

como executar o projeto?

O projeto está configurado como um monorepo (usando NPM Workspaces). Isso permite gerenciar tanto a API (backend) quanto o App Web (frontend) em um único diretório. O tutorial abaixo serve tanto se você clonar o projeto **localmente** quanto se estiver utilizando o **GitHub Codespaces**.

### 1. Instalação das dependências

Na raiz do repositório, rode o comando abaixo para instalar todas as bibliotecas necessárias do frontend e backend de uma só vez:

```bash
npm install
```

### 2. Configuração do Banco de Dados

A API utiliza SQLite em conjunto com o Drizzle ORM. Para gerar as tabelas no arquivo de banco de dados (`api/local.db`) e popular com dados de teste, execute na raiz do projeto:

```bash
# Cria as tabelas do banco de dados na API
npm run db:push -w api

# Opcional: Adiciona dados iniciais de teste (seeds)
npm run db:seed -w api
```

### 3. Iniciando os servidores

Para iniciar o servidor da API (porta `3001`) e o servidor do Frontend (porta `3000`) simultaneamente, execute na raiz do projeto:

```bash
npm run dev
```

### 🌍 Acessando a aplicação

**Cenário A: Rodando Localmente**
Se você estiver rodando na sua própria máquina, abra o navegador e acesse:
👉 `http://localhost:3000`
(O projeto já está configurado para consumir automaticamente a API em `http://localhost:3001`)

**Cenário B: Rodando no GitHub Codespaces**

1. O Codespaces abrirá as portas automaticamente na aba **"Ports"** (Portas) do terminal.
2. Acesse a URL gerada para a porta `3000`.
3. **Importante:** Certifique-se de que a porta `3001` (da API) está com a visibilidade definida como **Pública (Public)** clicando com o botão direito sobre ela na aba "Ports", caso contrário o frontend não conseguirá realizar as requisições para a API. A configuração da URL (`.github.dev`) é tratada dinamicamente pelo código do frontend de forma automática.

<br>

### 🎥 Demonstração do Projeto em Execução

- [Assistir a demonstração no PC (Desktop)](./pc.mp4)
- [Assistir a demonstração no Celular (Mobile)](./mobile.mp4)

---
