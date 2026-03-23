# 🤖 Projeto Integrado V - Inteligência Artificial (PUC-Campinas)

Este repositório contém a estrutura de um sistema que utiliza IA com **Python** no back-end e **React** no front-end.

---

## 📂 Estrutura do Projeto

O projeto é dividido em duas partes principais:

- **frontend**: Interface visual onde o usuário interage.
- **backend**: Onde a "mágica" da IA acontece.

---

## 🛠️ Pré-requisitos

Antes de tudo, instale as ferramentas abaixo (só precisa fazer uma vez):

- [Git](https://git-scm.com/downloads)
- [Node.js](https://nodejs.org/) (versão LTS recomendada)
- [Python](https://www.python.org/downloads/) (versão 3.10 ou superior)

---

## 📥 1. Clonando o Repositório (primeira vez)

Abra o terminal e rode:

```bash
git clone https://github.com/SEU-USUARIO/NOME-DO-REPO.git
```

Depois entre na pasta do projeto:

```bash
cd NOME-DO-REPO
```

> Substitua o link acima pelo link real do repositório no GitHub.

---

## 🌿 2. Criando sua Branch (só na primeira vez)

Nunca trabalhe direto na `main`. Cada integrante tem a **sua própria branch permanente**, nomeada com o seu nome. Você vai sempre trabalhar nela e fazer merge na `main` quando estiver pronto.

### Padrão de nome de branch:

```
nome
```

**Exemplos:**
- `maysa`
- `joao`
- `julia`

### Como criar sua branch (só uma vez):

Primeiro, garanta que você está na `main` atualizada:

```bash
git checkout main
git pull origin main
```

Agora crie e entre na sua branch:

```bash
git checkout -b seu-nome
```

Envie ela para o GitHub:

```bash
git push origin seu-nome
```

> A partir de agora, sempre que for trabalhar, entre direto na sua branch:
> ```bash
> git checkout seu-nome
> ```

---

## 💾 3. Salvando seu Trabalho (commit e push)

Depois de fazer alguma alteração no código, siga esses passos:

**1. Veja o que foi alterado:**
```bash
git status
```

**2. Adicione os arquivos alterados:**
```bash
git add .
```

> O `.` adiciona tudo. Se quiser adicionar só um arquivo específico: `git add nome-do-arquivo`

**3. Faça o commit com uma mensagem descritiva:**
```bash
git commit -m "feat: descrição clara do que você fez"
```

> Exemplos de boas mensagens: `"feat: cria tela de login"`, `"fix: corrige erro na API"`, `"chore: atualiza dependências"`

**4. Envie para o GitHub:**
```bash
git push origin seu-nome
```

---

## 🔀 4. Atualizando sua Branch com a Main (pull)

Antes de começar a trabalhar, sempre atualize sua branch com o que tem na `main` para não ficar desatualizado:

```bash
git checkout main
git pull origin main
git checkout seu-nome
git merge main
```

Se aparecerem **conflitos**, o Git vai indicar quais arquivos precisam de atenção. Resolva os conflitos no VS Code (ele mostra as diferenças lado a lado), salve e depois:

```bash
git add .
git commit -m "merge: resolve conflitos com a main"
git push origin seu-nome
```

---

## ✅ 5. Fazendo Merge na Main (via terminal)

Quando sua parte estiver pronta para ir para a `main`:

**1. Certifique-se de que sua branch está atualizada e sem pendências:**
```bash
git status
git push origin seu-nome
```

**2. Vá para a `main` e atualize ela:**
```bash
git checkout main
git pull origin main
```

**3. Faça o merge da sua branch na `main`:**
```bash
git merge seu-nome
```

**4. Se não houver conflitos, envie a `main` atualizada para o GitHub:**
```bash
git push origin main
```

**5. Volte para a sua branch e continue trabalhando:**
```bash
git checkout seu-nome
```

> Se aparecerem **conflitos** no merge, o Git vai indicar os arquivos. Resolva no VS Code, salve e depois:
> ```bash
> git add .
> git commit -m "merge: resolve conflitos"
> git push origin main
> git checkout seu-nome
> ```

---

## 🎨 Front-end (React + Vite)

Para rodar a interface visual, você precisa ter o **Node.js** instalado.

### Como rodar:

1. Entre na pasta:
   ```bash
   cd frontend
   ```

2. Instale as bibliotecas (só na primeira vez):
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

4. Clique no link que aparecerá no terminal (ex: `http://localhost:5173`) para ver o site no navegador.

---

## ⚙️ Back-end (Python + FastAPI)

O back-end utiliza um **Ambiente Virtual (venv)**.

> 🤔 **O que é a venv?** É uma "caixinha isolada" para as bibliotecas do projeto. Assim elas não interferem em outros projetos Python do seu computador.

### Como rodar:

1. Entre na pasta:
   ```bash
   cd backend
   ```

2. Crie a venv
   ```bash
   python -m venv venv
   ```

3. Ative o ambiente virtual:

   **No Windows:**
   ```bash
   .\venv\Scripts\activate
   ```

   **No Mac/Linux:**
   ```bash
   source venv/bin/activate
   ```

   Você saberá que deu certo porque aparecerá `(venv)` antes do caminho no terminal.

4. Instale as bibliotecas (se for a primeira vez):
   ```bash
   pip install fastapi uvicorn
   ```

5. Rode o servidor:
   ```bash
   uvicorn main:app --reload
   ```

---

## 🚀 Tecnologias Utilizadas

- **React + Vite**: Para uma interface rápida e moderna.
- **FastAPI**: Para o Python conversar com o React de forma veloz.
- **Node.js & Python**: Os motores que sustentam o projeto.

---

## 💡 Dicas para o Grupo

- Cada pessoa tem sua branch permanente com seu nome — não delete, não crie outra.
- Sempre atualize sua branch com a `main` antes de começar a trabalhar (`git merge main`).
- Nunca commite direto na `main`.
- Escreva mensagens de commit descritivas — ajuda muito na hora de entender o histórico.
- Antes de fazer merge na `main`, garanta que seu código está funcionando.
- Na primeira vez que for rodar o projeto: execute `npm install` no front e `pip install` no back.
