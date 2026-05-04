# Configuração do Ollama (IA Local)

Substituímos a dependência do Google Gemini pelo **Ollama**, uma ferramenta que nos permite rodar Grandes Modelos de Linguagem (LLMs) localmente. Isso traz vantagens como custo zero para uso da API, privacidade de dados médicos e estruturação nativa em JSON.

Siga o passo a passo abaixo para configurar o ambiente corretamente na sua máquina.

## Passo 1: Instalar o Ollama
O Ollama vai rodar em segundo plano como o nosso servidor de IA.

1. Acesse o site oficial: [https://ollama.com/download](https://ollama.com/download)
2. Baixe a versão para o seu sistema operacional (Windows, macOS ou Linux).
3. Execute o instalador padrão ("Next, Next, Install").
4. Após instalar, ele ficará aberto em segundo plano (você verá o ícone de uma lhama perto do relógio do sistema no Windows/Mac).

## Passo 2: Baixar e Rodar o Modelo (Llama 3.2)
Nosso `ia_service.py` está configurado para consumir o modelo leve **Llama 3.2**. É preciso realizar o download da "inteligência" do modelo (cerca de 2 GB).

1. Abra o seu Terminal ou PowerShell.
2. Digite o seguinte comando e aperte Enter:
   ```bash
   ollama run llama3.2
   ```
3. O download começará automaticamente. Assim que atingir 100%, você verá um prompt (`>>>`). Isso significa que a IA está pronta.
4. Você pode testar enviando um "Olá". Para sair do chat interativo, basta pressionar `Ctrl + D` ou digitar `/bye`.
5. **Importante:** O servidor do Ollama continuará ativo no endereço `http://localhost:11434` mesmo após você fechar esse chat do terminal.

## Passo 3: Atualizar as Dependências do Backend
Como mudamos a integração (removendo a SDK do Google e adicionando a biblioteca `requests`), é preciso atualizar o Python.

No terminal, na raiz do projeto, execute:
```bash
pip install -r backend/requirements.txt
```

## Passo 4: Rodando a Aplicação
Tudo pronto! Você não precisará configurar chaves de API (`GEMINI_API_KEY`) no seu `.env` para esta funcionalidade.

Ao iniciar o seu backend (`main.py`), a função de estruturar prontuários já enviará o áudio transcrito para o seu Ollama local.

---

### Dicas Extras / Solução de Problemas

- **Para consultar se o Ollama está rodando:**
  Abra o navegador e acesse: [http://localhost:11434](http://localhost:11434). Você deve ver a mensagem `Ollama is running`.

---

### 🧠 Opções de Modelos (Qualidade vs. Desempenho)

Estamos usando o **Llama 3.2** como padrão para desenvolvimento porque ele é muito leve e roda bem em qualquer computador sem travar. Porém, para a versão final de produção do sistema, temos opções melhores:

1. **Llama 3.2 (3B)** - *O atual (leve)*
   - **Comando:** `ollama run llama3.2`
   - **Uso:** Ótimo para desenvolver localmente. Exige pouca RAM.
2. **Qwen 2.5 (7B ou 3B)** - *O mais recomendado para o produto final*
   - **Comando:** `ollama run qwen2.5` (ou `qwen2.5:3b` para PCs mais fracos)
   - **Uso:** Modelo da Alibaba com um **desempenho excepcional em Português** e estruturação de JSON. Melhor custo-benefício de qualidade.
3. **Llama 3.1 (8B)** - *O modelo inteligente robusto*
   - **Comando:** `ollama run llama3.1`
   - **Uso:** Mais pesado (exige ~8GB de RAM), porém tem um vocabulário e compreensão de contexto médico muito superiores.

**Como mudar de modelo?**
Para trocar o modelo no projeto, basta rodar o comando `ollama run nome-do-modelo` correspondente no terminal para baixá-lo. Em seguida, vá no seu arquivo `backend/.env` e defina a variável: `OLLAMA_MODEL="nome-do-modelo"`.
