import json
import os
import whisper
import requests


WHISPER_MODEL_NAME = os.getenv("WHISPER_MODEL", "base")
OLLAMA_MODEL_NAME = os.getenv("OLLAMA_MODEL", "llama3.2")
OLLAMA_API_URL = os.getenv(
    "OLLAMA_API_URL",
    "http://localhost:11434/api/generate"
)

whisper_model = whisper.load_model(WHISPER_MODEL_NAME)


SYSTEM_PROMPT_VETERINARIO = """
Você é um assistente especializado em documentação clínica veterinária.

Sua função é transformar transcrições de consultas veterinárias em prontuários clínicos claros, organizados e profissionais.

Regras obrigatórias:
- Retorne apenas JSON válido.
- Não use markdown.
- Não escreva texto fora do JSON.
- Não invente informações.
- Se uma informação não estiver presente na transcrição, escreva "Não informado".
- Use linguagem veterinária profissional, mas clara.
- Não diga que é uma IA.
- Não crie diagnóstico definitivo sem base na transcrição.
- Quando houver incerteza, use "suspeita clínica" ou "relatado pelo tutor".
- Preserve sintomas, duração, alimentação, ingestão hídrica, urina, fezes, vômitos, diarreia, exame físico, conduta, prescrição e retorno.
"""


PROMPT_VETERINARIO = """
Analise a transcrição de uma consulta veterinária e transforme em um prontuário estruturado.

Retorne APENAS um objeto JSON válido contendo exatamente as chaves abaixo:

{
  "identificacao": {
    "nome_animal": "",
    "especie": "",
    "raca": "",
    "sexo": "",
    "idade": "",
    "tutor": ""
  },
  "queixa_principal": "",
  "anamnese": "",
  "exame_fisico": "",
  "suspeita_clinica_ou_diagnostico": "",
  "conduta_realizada": "",
  "prescricao": "",
  "orientacoes_ao_tutor": "",
  "retorno": "",
  "observacoes": "",
  "resumo": "",
  "diagnostico": "",
  "tratamento": ""
}

Regras:
- Preencha "resumo", "diagnostico" e "tratamento" também, pois esses campos são usados pelo sistema atual.
- Em "diagnostico", não invente diagnóstico. Se não houver diagnóstico claro, escreva "Não informado" ou "Suspeita clínica não definida".
- Em "tratamento", inclua somente tratamentos, condutas ou recomendações mencionadas.
- Se algum dado não aparecer na transcrição, use "Não informado".

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
    return PROMPT_VETERINARIO.format(texto_transcrito=texto_transcrito)


def validar_json_prontuario(dados: dict, texto_transcrito: str) -> dict:
    identificacao = dados.get("identificacao", {})

    return {
        "identificacao": {
            "nome_animal": identificacao.get("nome_animal", "Não informado"),
            "especie": identificacao.get("especie", "Não informado"),
            "raca": identificacao.get("raca", "Não informado"),
            "sexo": identificacao.get("sexo", "Não informado"),
            "idade": identificacao.get("idade", "Não informado"),
            "tutor": identificacao.get("tutor", "Não informado"),
        },
        "queixa_principal": dados.get("queixa_principal", "Não informado"),
        "anamnese": dados.get("anamnese", "Não informado"),
        "exame_fisico": dados.get("exame_fisico", "Não informado"),
        "suspeita_clinica_ou_diagnostico": dados.get(
            "suspeita_clinica_ou_diagnostico",
            "Não informado"
        ),
        "conduta_realizada": dados.get("conduta_realizada", "Não informado"),
        "prescricao": dados.get("prescricao", "Não informado"),
        "orientacoes_ao_tutor": dados.get("orientacoes_ao_tutor", "Não informado"),
        "retorno": dados.get("retorno", "Não informado"),
        "observacoes": dados.get("observacoes", "Não informado"),

        # Campos antigos mantidos para não quebrar o sistema atual
        "resumo": dados.get("resumo", texto_transcrito),
        "diagnostico": dados.get("diagnostico", "Não informado"),
        "tratamento": dados.get("tratamento", "Não informado"),
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
            "identificacao": {
                "nome_animal": "Não informado",
                "especie": "Não informado",
                "raca": "Não informado",
                "sexo": "Não informado",
                "idade": "Não informado",
                "tutor": "Não informado",
            },
            "queixa_principal": "Não foi possível extrair estruturadamente.",
            "anamnese": texto_transcrito,
            "exame_fisico": "Não informado",
            "suspeita_clinica_ou_diagnostico": "Não informado",
            "conduta_realizada": "Não informado",
            "prescricao": "Não informado",
            "orientacoes_ao_tutor": "Não informado",
            "retorno": "Não informado",
            "observacoes": "Erro ao estruturar com Ollama.",

            # Campos antigos
            "resumo": texto_transcrito,
            "diagnostico": "Não foi possível extrair estruturadamente.",
            "tratamento": "Não foi possível extrair estruturadamente.",
        }