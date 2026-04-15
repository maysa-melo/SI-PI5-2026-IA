# 🐾 AnimalTalk - Sistema de Prontuários Veterinários

Projeto desenvolvido para o **Projeto Integrado V - Inteligência Artificial (PUC-Campinas)**.
Este sistema permite gerenciar **tutores**, **pets** e **prontuários clínicos**, com integração entre **Front-end (React + Vite)**, **Back-end (FastAPI)** e **PostgreSQL**. O README original do projeto já trazia a base da estrutura, front, back e fluxo de Git, e este documento expande isso com o passo a passo completo para rodar tudo do zero. 

---

# ✅ O que o sistema faz hoje

* Cadastro de tutores
* Cadastro de pets
* Criação de prontuários
* Edição de prontuários
* Exclusão de prontuários
* Dashboard com dados reais
* Histórico clínico real por paciente
* Integração completa entre front, back e banco
* Autenticação de veterinários (login com validação no banco)
* Controle de acesso por e-mail e senha

---

# 🧱 Tecnologias utilizadas

* **React + Vite** — front-end
* **FastAPI** — back-end
* **Python** — API
* **PostgreSQL** — banco de dados
* **pgAdmin** — gerenciamento visual do banco
* **Axios** — comunicação entre front e back

---

# 💻 Sistemas compatíveis

## Funciona para desenvolvimento local em:

* **Windows**
* **macOS**

## Não é indicado para:

* **iPhone / iPad (iOS)**
* **Android**

Esses dispositivos podem acessar o sistema pelo navegador depois de publicado, mas **não são ambientes adequados para rodar o projeto localmente**.

---

# 📂 Estrutura do projeto

```text
SI-PI5-2026-IA/
├── backend/
├── frontend/
└── README.md
```

---

# 🛠️ Pré-requisitos

Instale antes de começar:

## Obrigatórios

* **Git**
* **Node.js** (LTS recomendada)
* **Python 3.10+**
* **PostgreSQL**
* **pgAdmin** (opcional, mas recomendado)

## Links oficiais

* Git
* Node.js
* Python
* PostgreSQL
* pgAdmin

---

# 📥 1. Clonar o repositório

Abra o terminal e rode:

```bash
git clone https://github.com/maysa-melo/SI-PI5-2026-IA.git
cd SI-PI5-2026-IA
```

---

# 🗄️ 2. Criar o banco de dados PostgreSQL

Você pode fazer isso pelo **pgAdmin** ou por SQL.

---

## Opção A — pelo pgAdmin

1. Abra o **pgAdmin**
2. Conecte no seu servidor PostgreSQL
3. Clique com o botão direito em **Databases**
4. Clique em **Create > Database**
5. Crie um banco com um nome como:

```text
animaltalk
```

---

## Opção B — por SQL

Abra o Query Tool no pgAdmin e rode:

```sql
CREATE DATABASE animaltalk;
```

---

# ⚙️ 3. Configurar a conexão do backend com o banco

Agora você precisa garantir que o backend esteja apontando para o banco que você criou.

## Procure no backend

Verifique o arquivo responsável pela conexão com banco, normalmente algo como:

```text
backend/database.py
```

ou um `.env`, se o projeto estiver usando variável de ambiente.

## A conexão precisa bater com:

* nome do banco
* usuário do PostgreSQL
* senha
* host
* porta

## Exemplo de conexão local comum

```python
postgresql://postgres:SUA_SENHA@localhost:5432/animaltalk
```

## Confira estes dados:

* **usuário:** normalmente `postgres`
* **senha:** a senha que você definiu ao instalar o PostgreSQL
* **host:** `localhost`
* **porta:** `5432`
* **banco:** `animaltalk`

> Se o backend estiver apontando para outro banco, o sistema não vai salvar nem ler os dados corretos.

---

# 🧾 4. Criar as tabelas no banco

O projeto usa estas tabelas principais:

* `clientes`
* `pets`
* `prontuarios`
* `veterinarios`

## Se o projeto já criar tabelas automaticamente

Se o backend tiver algo como `Base.metadata.create_all(...)`, basta rodar o backend e ele criará as tabelas automaticamente.

## Se não criar automaticamente

Se as tabelas não forem criadas automaticamente pelo backend, use as queries abaixo no pgAdmin > Query Tool.

1. Tabela clientes
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    sexo VARCHAR(30),
    nacionalidade VARCHAR(60),
    estado_civil VARCHAR(30),
    cpf VARCHAR(14) UNIQUE,
    rg VARCHAR(20),
    data_nascimento DATE,
    profissao VARCHAR(100),
    como_conheceu VARCHAR(100),
    matricula_convenio VARCHAR(50),
    email VARCHAR(150),
    facebook VARCHAR(150),
    instagram VARCHAR(150),
    marcacao_neutra TEXT,
    marcacao_positiva TEXT,
    foto_url TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
2. Tabela pets
CREATE TABLE pets (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL,
    nome VARCHAR(100) NOT NULL,
    especie VARCHAR(50) NOT NULL,
    raca VARCHAR(100),
    vivo BOOLEAN DEFAULT TRUE,
    peso_kg NUMERIC(6,2),
    data_nascimento DATE,
    sexo VARCHAR(20),
    castrado BOOLEAN,
    porte VARCHAR(30),
    cor VARCHAR(50),
    pelagem VARCHAR(50),
    pedigree VARCHAR(100),
    chip VARCHAR(100),
    matricula_convenio VARCHAR(50),
    foto_url TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cliente
        FOREIGN KEY (cliente_id)
        REFERENCES clientes(id)
        ON DELETE CASCADE
);
3. Tabela prontuarios
CREATE TABLE prontuarios (
    id SERIAL PRIMARY KEY,
    pet_id INTEGER NOT NULL,
    tipo VARCHAR(100),
    veterinario VARCHAR(150),
    resumo TEXT,
    diagnostico TEXT,
    tratamento TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pet
        FOREIGN KEY (pet_id)
        REFERENCES pets(id)
        ON DELETE CASCADE
);

# 🔐 4.1 Autenticação de Veterinários (Login)

O sistema agora possui autenticação real de usuários veterinários.

## Como funciona

* Apenas veterinários cadastrados no banco conseguem acessar o sistema
* O login valida:
  - e-mail existente
  - senha correta (criptografada com bcrypt)
* A senha **não é salva em texto puro**, apenas em formato hash

---

## 📊 Tabela veterinarios

Se não existir, crie a tabela:

CREATE TABLE veterinarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    crmv VARCHAR(50),
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

## Para conferir se as tabelas existem:

No pgAdmin, vá em:

```text
Schemas > public > Tables
```

Você deve ver:

* `clientes`
* `pets`
* `prontuarios`
* `veterinarios`

---

## 👤 Cadastro de veterinário

Você pode cadastrar de duas formas:

✔ Opção 1 — via API (recomendado)

* No Swagger (/docs), use:

POST /veterinarios

Exemplo:

{
  "nome": "Isabelle Silveira Alves",
  "email": "isabelle@gmail.com",
  "senha": "12345",
  "crmv": "CRMV-12345",
  "ativo": true
}
✔ Opção 2 — direto no banco

## ⚠️ IMPORTANTE: a senha deve estar em HASH (bcrypt)

Para gerar um hash:

python -c "import bcrypt; print(bcrypt.hashpw('12345'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8'))"

Depois inserir:

INSERT INTO veterinarios (
    nome,
    email,
    senha_hash,
    crmv,
    ativo
) VALUES (
    'Isabelle Silveira Alves',
    'isabelle@gmail.com',
    'HASH_GERADO_AQUI',
    'CRMV-12345',
    TRUE
);

## 🔑 Login

Endpoint:

POST /auth/login

Exemplo:

{
  "email": "isabelle@gmail.com",
  "senha": "12345"
}

## ✅ Resultado esperado

* Se estiver correto:

{
  "mensagem": "Login realizado com sucesso",
  "veterinario": {
    "id": 1,
    "nome": "Isabelle Silveira Alves",
    "email": "isabelle@gmail.com",
    ...
  }
}

* Se estiver errado:

{
  "detail": "E-mail ou senha inválidos"
}

## 🔒 Segurança
Senhas protegidas com bcrypt
Validação feita no backend
Apenas usuários cadastrados podem acessar o sistema

# 🐍 5. Rodar o backend

Abra um terminal na raiz do projeto e entre em:

```bash
cd backend
```

---

## 5.1 Criar ambiente virtual

### Windows

```bash
python -m venv venv
```

### macOS

```bash
python3 -m venv venv
```

---

## 5.2 Ativar ambiente virtual

### Windows

```bash
.\venv\Scripts\activate
```

### macOS

```bash
source venv/bin/activate
```

Se deu certo, o terminal vai mostrar algo como:

```text
(venv)
```

---

## 5.3 Instalar dependências

### Windows

```bash
pip install -r requirements.txt
```

### macOS

```bash
pip3 install -r requirements.txt
```

Se `pip3` não funcionar, use:

```bash
python3 -m pip install -r requirements.txt
```

---

## 5.4 Rodar a API

```bash
uvicorn main:app --reload
```

Se estiver tudo certo, a API vai subir em:

```text
http://127.0.0.1:8000
```

E a documentação Swagger ficará em:

```text
http://127.0.0.1:8000/docs
```

---

# 🧪 6. Testar se o backend está funcionando

Abra no navegador:

```text
http://127.0.0.1:8000/docs
```

Verifique se existem endpoints como:

* `/clientes`
* `/pets`
* `/prontuarios`
* `/veterinarios`
* `/auth/login`

Se esses endpoints aparecerem, o backend está no ar.

---

# 🎨 7. Rodar o frontend

Abra **outro terminal** na raiz do projeto e entre em:

```bash
cd frontend
```

## 7.1 Instalar dependências

```bash
npm install
```

## 7.2 Rodar o front

```bash
npm run dev
```

O terminal mostrará algo como:

```text
http://localhost:5173
```

Abra esse endereço no navegador.

---

# 🔗 8. Verificar se front e back estão conectados

O frontend deve estar apontando para o backend local.

Confira no arquivo da API do front, normalmente algo como:

```text
frontend/src/app/utils/api.js
```

A baseURL deve ser:

```js
http://127.0.0.1:8000
```

Se estiver diferente, ajuste.

---

# ✅ 9. Fluxo de teste completo

Depois de subir tudo, siga este roteiro:

## 9.1 Testar cadastro de paciente

1. Abrir o sistema no navegador
2. Clicar em **Novo Paciente**
3. Cadastrar tutor e pet
4. Confirmar se salvou no banco

### Conferir no pgAdmin:

```sql
SELECT * FROM clientes ORDER BY id DESC;
SELECT * FROM pets ORDER BY id DESC;
```

---

## 9.2 Testar criação de prontuário

1. Ir para o dashboard
2. Clicar em **Novo Prontuário**
3. Escolher um paciente
4. Iniciar atendimento
5. Finalizar

### Conferir no pgAdmin:

```sql
SELECT * FROM prontuarios ORDER BY id DESC;
```

---

## 9.3 Testar edição de prontuário

1. Abrir um paciente
2. Entrar no perfil ou histórico
3. Editar diagnóstico, resumo ou tratamento
4. Salvar

### Conferir no banco:

```sql
SELECT * FROM prontuarios ORDER BY id DESC;
```

---

## 9.4 Testar exclusão de prontuário

1. Abrir um paciente
2. Localizar prontuário
3. Excluir
4. Confirmar remoção visual e no banco

---

## 9.5 Testar dashboard

Conferir se o dashboard mostra corretamente:

* total de prontuários
* pacientes cadastrados
* tutores cadastrados
* últimos atendimentos reais

## 9.6 Testar login

1. Acessar a tela de login
2. Inserir e-mail e senha cadastrados
3. Confirmar acesso ao dashboard

### Teste inválido:

1. Inserir senha errada
2. Confirmar mensagem de erro

---

# 🔍 Consultas úteis no banco

```sql
SELECT * FROM clientes ORDER BY id DESC;
SELECT * FROM pets ORDER BY id DESC;
SELECT * FROM prontuarios ORDER BY id DESC;
```

Para contar registros:

```sql
SELECT COUNT(*) FROM clientes;
SELECT COUNT(*) FROM pets;
SELECT COUNT(*) FROM prontuarios;
```

---

# 🧯 Problemas comuns e solução

## Erro ao rodar `npm install`

Verifique se o Node.js foi instalado corretamente:

```bash
node -v
npm -v
```

---

## Erro ao rodar `uvicorn`

Verifique se o ambiente virtual está ativado e se as dependências foram instaladas.

---

## Erro de conexão com banco

Verifique:

* nome do banco
* usuário
* senha
* porta
* conexão no `database.py` ou `.env`

---

## Erro de login (401 Unauthorized)

Verifique:

* se o e-mail está correto
* se o veterinário existe no banco
* se a senha foi salva com hash bcrypt
* se o campo `ativo` está como TRUE

---
## Frontend abre mas não carrega dados

Verifique:

* se o backend está rodando
* se a `baseURL` do Axios está correta
* se o CORS do backend está permitindo `http://localhost:5173`

---

## Tabela `prontuarios` não existe

Crie a tabela manualmente no pgAdmin ou confirme se o backend cria automaticamente.

---

## Backend sobe, mas `/docs` não mostra endpoint novo

Pare e rode novamente:

```bash
uvicorn main:app --reload
```

---

# 🌿 Fluxo de Git para a equipe

## Atualizar projeto

```bash
git checkout main
git pull origin main
```

## Criar branch

```bash
git checkout -b seu-nome
git push origin seu-nome
```

## Salvar alterações

```bash
git add .
git commit -m "feat: descrição clara"
git push origin seu-nome
```

## Atualizar sua branch com a main

```bash
git checkout main
git pull origin main
git checkout seu-nome
git merge main
```

## Fazer merge na main

```bash
git checkout main
git pull origin main
git merge sua-branch
git push origin main
```

---

# 📌 Status atual do projeto

Atualmente o sistema já possui:

* CRUD de tutores
* CRUD de pets
* CRUD de prontuários
* dashboard real
* histórico clínico real
* integração completa front + back + banco

---

# 🚀 Próximos passos do projeto

* integração da IA para geração automática de prontuários
* exportação de PDF
* autenticação de usuários
* deploy do sistema


