import json
import os
import whisper
import requests


WHISPER_MODEL_NAME = os.getenv("WHISPER_MODEL", "base")
OLLAMA_MODEL_NAME = os.getenv("OLLAMA_MODEL", "llama3.2:latest")
OLLAMA_API_URL = os.getenv(
    "OLLAMA_API_URL",
    "http://localhost:11434/api/generate"
)

whisper_model = whisper.load_model(WHISPER_MODEL_NAME)


SYSTEM_PROMPT_VETERINARIO = """
Você é um assistente especialista em documentação clínica veterinária.

Sua função é ler transcrições de áudios de consultas e extrair as informações.

Regras:
1. Retorne APENAS um objeto JSON.
2. O JSON deve ter apenas e exatamente as três chaves abaixo.
3. Não use markdown, apenas JSON cru.

Use as seguintes chaves:
- "resumo": Queixa principal, histórico de sintomas e exame físico ditos no áudio.
- "diagnostico": Diagnóstico definitivo ou suspeita clínica.
- "tratamento": Medicações prescritas, orientações e prazos de retorno.
"""

PROMPT_VETERINARIO = """
Com base na transcrição da consulta abaixo, retorne um objeto JSON.

O JSON DEVE CONTER EXATAMENTE ESTAS TRÊS CHAVES: "resumo", "diagnostico" e "tratamento".
O valor de cada chave DEVE ser um único texto contínuo (string), e NÃO uma lista [].
Não use palavras difíceis, preencha formatando como um médico preencheria a ficha do paciente com o que ouviu.
MUITO IMPORTANTE: Não altere o diagnóstico da fala e não tente prever uma nova doença que não foi falada no áudio (como viroses ou disfunções).

Transcrição:
\"\"\"
{texto_transcrito}
\"\"\"
"""


def limpar_transcricao(texto: str) -> str:
    texto = texto.strip()
    texto = " ".join(texto.split())
    return texto


def transcrever_audio(caminho_arquivo: str) -> str:
    try:
        resultado = whisper_model.transcribe(
            caminho_arquivo,
            language="pt",
            task="transcribe",
            fp16=False,
            temperature=0,
            initial_prompt=(
                "Consulta veterinária em português do Brasil. "
                "Termos comuns: tutor, pet, cão, gato, cachorro, felino, canino, "
                "anamnese, queixa principal, exame físico, vacinação, vermifugação, "
                "apetite, ingestão hídrica, urina, fezes, vômito, diarreia, tosse, "
                "prurido, dor, claudicação, mucosas, linfonodos, ausculta, "
                "temperatura, frequência cardíaca, frequência respiratória, "
                "diagnóstico, suspeita clínica, conduta, prescrição e retorno."
            )
        )

        texto = resultado.get("text", "")
        texto = limpar_transcricao(texto)

        if not texto:
            raise ValueError("A transcrição retornou vazia.")

        return texto

    except Exception as erro:
        raise Exception(f"Erro ao transcrever áudio com Whisper: {erro}")


def montar_prompt_prontuario(texto_transcrito: str) -> str:
    return PROMPT_VETERINARIO.replace(
        "{texto_transcrito}",
        texto_transcrito
    )


def validar_json_prontuario(dados: dict, texto_transcrito: str) -> dict:
    return {
        "resumo": str(dados.get("resumo", texto_transcrito)),
        "diagnostico": str(dados.get("diagnostico", "Não informado - Extraído automaticamente")),
        "tratamento": str(dados.get("tratamento", "Não informado - Extraído automaticamente")),
    }


def estruturar_prontuario(texto_transcrito: str) -> dict:
    texto_transcrito = limpar_transcricao(texto_transcrito)
    prompt = montar_prompt_prontuario(texto_transcrito)

    payload = {
        "model": OLLAMA_MODEL_NAME,
        "system": SYSTEM_PROMPT_VETERINARIO,
        "prompt": prompt,
        "stream": False,
        "format": "json",
        "options": {
            "temperature": 0.2,
            "top_p": 0.9,
            "num_ctx": 8192
        }
    }

    try:
        resposta = requests.post(
            OLLAMA_API_URL,
            json=payload,
            timeout=180
        )

        resposta.raise_for_status()
        dados_ollama = resposta.json()

        texto_resposta = dados_ollama.get("response", "").strip()

        if not texto_resposta:
            raise ValueError("Ollama retornou resposta vazia.")

        dados_json = json.loads(texto_resposta)

        return validar_json_prontuario(dados_json, texto_transcrito)

    except Exception as erro:
        print(f"Erro na integração com Ollama: {erro}")

        return {
            "resumo": f"TRANSCRIÇÃO DIRETA (Erro na IA):\n{texto_transcrito}",
            "diagnostico": "Não foi possível extrair estruturadamente.",
            "tratamento": "Não foi possível extrair estruturadamente.",
        }
