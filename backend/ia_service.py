import json
import os
import whisper
import requests

WHISPER_MODEL_NAME = "base"
OLLAMA_MODEL_NAME = os.getenv("OLLAMA_MODEL", "llama3.2")
OLLAMA_API_URL = os.getenv(
    "OLLAMA_API_URL", "http://localhost:11434/api/generate")

whisper_model = whisper.load_model(WHISPER_MODEL_NAME)

PROMPT_VETERINARIO = (
    "Voce e um assistente veterinario experiente. Analise a transcricao de uma "
    "consulta veterinaria, que pode estar desorganizada, e extraia as informacoes "
    "clinicas principais.\n\n"
    "Retorne APENAS um objeto JSON valido contendo exatamente as chaves abaixo, "
    "sem texto extra ou markdown.\n\n"
    "Estrutura esperada:\n"
    "{{\n"
    "  \"resumo\": \"Resumo dos sintomas, historico e motivo da consulta.\",\n"
    "  \"diagnostico\": \"Diagnostico provavel ou definitivo.\",\n"
    "  \"tratamento\": \"Plano de tratamento e recomendacoes.\"\n"
    "}}\n\n"
    "Transcricao:\n"
    "\"\"\"{texto_transcrito}\"\"\"\n"
)


def transcrever_audio(caminho_arquivo: str) -> str:
    resultado = whisper_model.transcribe(caminho_arquivo, language="pt")
    return resultado.get("text", "").strip()


def estruturar_prontuario(texto_transcrito: str) -> dict:
    prompt = PROMPT_VETERINARIO.format(texto_transcrito=texto_transcrito)

    payload = {
        "model": OLLAMA_MODEL_NAME,
        "prompt": prompt,
        "stream": False,
        "format": "json"
    }

    try:
        resposta = requests.post(OLLAMA_API_URL, json=payload, timeout=120)
        resposta.raise_for_status()
        dados = resposta.json()
        texto_resposta = dados.get("response", "")

        return json.loads(texto_resposta)
    except Exception as e:
        print(f"Erro na integracao com Ollama: {e}")
        return {
            "resumo": texto_transcrito,
            "diagnostico": "Nao foi possivel extrair estruturadamente.",
            "tratamento": "Nao foi possivel extrair estruturadamente.",
        }
