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

Sua função é transformar transcrições de consultas veterinárias em uma ficha de prontuário veterinário estruturada.

O prontuário deve seguir o formato de uma ficha clínica veterinária contendo:
- Identificação do tutor e paciente
- Queixa principal e histórico recente
- Anamnese por sistemas
- Alimentação
- Exame físico
- Suspeita clínica ou diagnóstico
- Conduta, prescrição, orientações e retorno

Regras obrigatórias:
- Retorne apenas JSON válido.
- Não use markdown.
- Não escreva texto fora do JSON.
- Não invente informações.
- Se uma informação não estiver presente na transcrição, escreva "Não informado".
- Para campos booleanos, use true, false ou null.
- Use null quando não houver informação suficiente para marcar sim ou não.
- Use linguagem veterinária profissional, mas clara.
- Não diga que é uma IA.
- Não crie diagnóstico definitivo sem base na transcrição.
- Quando houver incerteza, use "suspeita clínica" ou "relatado pelo tutor".
"""


PROMPT_VETERINARIO = """
Analise a transcrição de uma consulta veterinária e transforme em uma ficha de prontuário veterinário estruturada.

Retorne APENAS um objeto JSON válido contendo exatamente as chaves abaixo:

{
  "ficha_prontuario_numero": "",
  "identificacao": {
    "tutor": "",
    "paciente": "",
    "idade": "",
    "sexo": "",
    "raca": "",
    "especie": "",
    "peso": ""
  },
  "queixa_principal_historico_recente": "",
  "anamnese": {
    "doencas_pregressas": {
      "sim": null,
      "nao": null,
      "descricao": ""
    },
    "sistema_digestorio": {
      "vomito": null,
      "regurgitacao": null,
      "diarreia": null,
      "apetite": null,
      "ingestao_de_agua": null,
      "outro": ""
    },
    "sistema_urogenital": {
      "urina_normal": null,
      "volume": null,
      "dificuldade_miccao": null,
      "secrecao_vaginal": null,
      "castrado": null,
      "outro": ""
    },
    "sistema_cardiorrespiratorio": {
      "tosse": null,
      "cansaco_respiratorio": null,
      "secrecao_nasal": null,
      "outro": ""
    },
    "sistema_neurologico": {
      "convulsao": null,
      "inclinacao_cabeca": null,
      "ataxia": null,
      "outro": ""
    },
    "sistema_locomotor": {
      "dificuldade_locomocao": null,
      "alteracoes_posturais": null,
      "fraturas": null,
      "outro": ""
    },
    "pele": {
      "prurido": null,
      "ectoparasitas": null,
      "queda_de_pelo": null,
      "alopecia": null,
      "outro": ""
    },
    "olhos": {
      "secrecao_ocular": null,
      "deficit_visual": null,
      "prurido": null,
      "outro": ""
    },
    "ouvido": {
      "prurido": null,
      "secrecao": null,
      "outro": ""
    },
    "ambiente": {
      "rural": null,
      "urbano": null,
      "acesso_a_rua": null,
      "outro": ""
    },
    "contactantes": "",
    "produtos_toxicos": ""
  },
  "alimentacao": {
    "racao_e_petiscos": {
      "racao_seca_comercial": null,
      "racao_umida_comercial": null,
      "oferece_petiscos": null
    },
    "alimentacao_natural": {
      "crua_com_ossos": null,
      "crua_sem_ossos": null,
      "cozida": null
    },
    "observacoes": ""
  },
  "exame_fisico": {
    "temperatura": "",
    "frequencia_cardiaca": "",
    "frequencia_respiratoria": "",
    "mucosas": "",
    "hidratacao": "",
    "linfonodos": "",
    "ausculta": "",
    "dor": "",
    "observacoes": ""
  },
  "suspeita_clinica_ou_diagnostico": "",
  "conduta_realizada": "",
  "prescricao": "",
  "orientacoes_ao_tutor": "",
  "retorno": "",
  "observacoes_gerais": "",

  "resumo": "",
  "diagnostico": "",
  "tratamento": ""
}

Regras de preenchimento:
- Em campos de texto, escreva "Não informado" quando a informação não aparecer.
- Em campos booleanos, use:
  - true quando a transcrição confirmar a presença do sinal.
  - false quando a transcrição negar claramente o sinal.
  - null quando não houver informação.
- Não marque sintomas que não foram citados.
- Em "queixa_principal_historico_recente", escreva o motivo principal da consulta e a evolução recente.
- Em "resumo", faça um resumo clínico curto.
- Em "diagnostico", informe apenas se houver diagnóstico ou suspeita citada.
- Em "tratamento", informe condutas, prescrição e recomendações mencionadas.
- Mantenha "resumo", "diagnostico" e "tratamento", pois esses campos são usados pelo sistema atual.

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


def validar_bool(valor):
    if isinstance(valor, bool):
        return valor
    return None


def validar_json_prontuario(dados: dict, texto_transcrito: str) -> dict:
    identificacao = dados.get("identificacao", {})
    anamnese = dados.get("anamnese", {})
    alimentacao = dados.get("alimentacao", {})
    exame_fisico = dados.get("exame_fisico", {})

    doencas_pregressas = anamnese.get("doencas_pregressas", {})
    sistema_digestorio = anamnese.get("sistema_digestorio", {})
    sistema_urogenital = anamnese.get("sistema_urogenital", {})
    sistema_cardiorrespiratorio = anamnese.get("sistema_cardiorrespiratorio", {})
    sistema_neurologico = anamnese.get("sistema_neurologico", {})
    sistema_locomotor = anamnese.get("sistema_locomotor", {})
    pele = anamnese.get("pele", {})
    olhos = anamnese.get("olhos", {})
    ouvido = anamnese.get("ouvido", {})
    ambiente = anamnese.get("ambiente", {})

    racao_e_petiscos = alimentacao.get("racao_e_petiscos", {})
    alimentacao_natural = alimentacao.get("alimentacao_natural", {})

    return {
        "ficha_prontuario_numero": dados.get("ficha_prontuario_numero", "Não informado"),

        "identificacao": {
            "tutor": identificacao.get("tutor", "Não informado"),
            "paciente": identificacao.get("paciente", "Não informado"),
            "idade": identificacao.get("idade", "Não informado"),
            "sexo": identificacao.get("sexo", "Não informado"),
            "raca": identificacao.get("raca", "Não informado"),
            "especie": identificacao.get("especie", "Não informado"),
            "peso": identificacao.get("peso", "Não informado"),
        },

        "queixa_principal_historico_recente": dados.get(
            "queixa_principal_historico_recente",
            "Não informado"
        ),

        "anamnese": {
            "doencas_pregressas": {
                "sim": validar_bool(doencas_pregressas.get("sim")),
                "nao": validar_bool(doencas_pregressas.get("nao")),
                "descricao": doencas_pregressas.get("descricao", "Não informado"),
            },
            "sistema_digestorio": {
                "vomito": validar_bool(sistema_digestorio.get("vomito")),
                "regurgitacao": validar_bool(sistema_digestorio.get("regurgitacao")),
                "diarreia": validar_bool(sistema_digestorio.get("diarreia")),
                "apetite": validar_bool(sistema_digestorio.get("apetite")),
                "ingestao_de_agua": validar_bool(sistema_digestorio.get("ingestao_de_agua")),
                "outro": sistema_digestorio.get("outro", "Não informado"),
            },
            "sistema_urogenital": {
                "urina_normal": validar_bool(sistema_urogenital.get("urina_normal")),
                "volume": validar_bool(sistema_urogenital.get("volume")),
                "dificuldade_miccao": validar_bool(sistema_urogenital.get("dificuldade_miccao")),
                "secrecao_vaginal": validar_bool(sistema_urogenital.get("secrecao_vaginal")),
                "castrado": validar_bool(sistema_urogenital.get("castrado")),
                "outro": sistema_urogenital.get("outro", "Não informado"),
            },
            "sistema_cardiorrespiratorio": {
                "tosse": validar_bool(sistema_cardiorrespiratorio.get("tosse")),
                "cansaco_respiratorio": validar_bool(sistema_cardiorrespiratorio.get("cansaco_respiratorio")),
                "secrecao_nasal": validar_bool(sistema_cardiorrespiratorio.get("secrecao_nasal")),
                "outro": sistema_cardiorrespiratorio.get("outro", "Não informado"),
            },
            "sistema_neurologico": {
                "convulsao": validar_bool(sistema_neurologico.get("convulsao")),
                "inclinacao_cabeca": validar_bool(sistema_neurologico.get("inclinacao_cabeca")),
                "ataxia": validar_bool(sistema_neurologico.get("ataxia")),
                "outro": sistema_neurologico.get("outro", "Não informado"),
            },
            "sistema_locomotor": {
                "dificuldade_locomocao": validar_bool(sistema_locomotor.get("dificuldade_locomocao")),
                "alteracoes_posturais": validar_bool(sistema_locomotor.get("alteracoes_posturais")),
                "fraturas": validar_bool(sistema_locomotor.get("fraturas")),
                "outro": sistema_locomotor.get("outro", "Não informado"),
            },
            "pele": {
                "prurido": validar_bool(pele.get("prurido")),
                "ectoparasitas": validar_bool(pele.get("ectoparasitas")),
                "queda_de_pelo": validar_bool(pele.get("queda_de_pelo")),
                "alopecia": validar_bool(pele.get("alopecia")),
                "outro": pele.get("outro", "Não informado"),
            },
            "olhos": {
                "secrecao_ocular": validar_bool(olhos.get("secrecao_ocular")),
                "deficit_visual": validar_bool(olhos.get("deficit_visual")),
                "prurido": validar_bool(olhos.get("prurido")),
                "outro": olhos.get("outro", "Não informado"),
            },
            "ouvido": {
                "prurido": validar_bool(ouvido.get("prurido")),
                "secrecao": validar_bool(ouvido.get("secrecao")),
                "outro": ouvido.get("outro", "Não informado"),
            },
            "ambiente": {
                "rural": validar_bool(ambiente.get("rural")),
                "urbano": validar_bool(ambiente.get("urbano")),
                "acesso_a_rua": validar_bool(ambiente.get("acesso_a_rua")),
                "outro": ambiente.get("outro", "Não informado"),
            },
            "contactantes": anamnese.get("contactantes", "Não informado"),
            "produtos_toxicos": anamnese.get("produtos_toxicos", "Não informado"),
        },

        "alimentacao": {
            "racao_e_petiscos": {
                "racao_seca_comercial": validar_bool(racao_e_petiscos.get("racao_seca_comercial")),
                "racao_umida_comercial": validar_bool(racao_e_petiscos.get("racao_umida_comercial")),
                "oferece_petiscos": validar_bool(racao_e_petiscos.get("oferece_petiscos")),
            },
            "alimentacao_natural": {
                "crua_com_ossos": validar_bool(alimentacao_natural.get("crua_com_ossos")),
                "crua_sem_ossos": validar_bool(alimentacao_natural.get("crua_sem_ossos")),
                "cozida": validar_bool(alimentacao_natural.get("cozida")),
            },
            "observacoes": alimentacao.get("observacoes", "Não informado"),
        },

        "exame_fisico": {
            "temperatura": exame_fisico.get("temperatura", "Não informado"),
            "frequencia_cardiaca": exame_fisico.get("frequencia_cardiaca", "Não informado"),
            "frequencia_respiratoria": exame_fisico.get("frequencia_respiratoria", "Não informado"),
            "mucosas": exame_fisico.get("mucosas", "Não informado"),
            "hidratacao": exame_fisico.get("hidratacao", "Não informado"),
            "linfonodos": exame_fisico.get("linfonodos", "Não informado"),
            "ausculta": exame_fisico.get("ausculta", "Não informado"),
            "dor": exame_fisico.get("dor", "Não informado"),
            "observacoes": exame_fisico.get("observacoes", "Não informado"),
        },

        "suspeita_clinica_ou_diagnostico": dados.get(
            "suspeita_clinica_ou_diagnostico",
            "Não informado"
        ),
        "conduta_realizada": dados.get("conduta_realizada", "Não informado"),
        "prescricao": dados.get("prescricao", "Não informado"),
        "orientacoes_ao_tutor": dados.get("orientacoes_ao_tutor", "Não informado"),
        "retorno": dados.get("retorno", "Não informado"),
        "observacoes_gerais": dados.get("observacoes_gerais", "Não informado"),

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
            "ficha_prontuario_numero": "Não informado",

            "identificacao": {
                "tutor": "Não informado",
                "paciente": "Não informado",
                "idade": "Não informado",
                "sexo": "Não informado",
                "raca": "Não informado",
                "especie": "Não informado",
                "peso": "Não informado",
            },

            "queixa_principal_historico_recente": texto_transcrito,

            "anamnese": {
                "doencas_pregressas": {
                    "sim": None,
                    "nao": None,
                    "descricao": "Não informado",
                },
                "sistema_digestorio": {
                    "vomito": None,
                    "regurgitacao": None,
                    "diarreia": None,
                    "apetite": None,
                    "ingestao_de_agua": None,
                    "outro": "Não informado",
                },
                "sistema_urogenital": {
                    "urina_normal": None,
                    "volume": None,
                    "dificuldade_miccao": None,
                    "secrecao_vaginal": None,
                    "castrado": None,
                    "outro": "Não informado",
                },
                "sistema_cardiorrespiratorio": {
                    "tosse": None,
                    "cansaco_respiratorio": None,
                    "secrecao_nasal": None,
                    "outro": "Não informado",
                },
                "sistema_neurologico": {
                    "convulsao": None,
                    "inclinacao_cabeca": None,
                    "ataxia": None,
                    "outro": "Não informado",
                },
                "sistema_locomotor": {
                    "dificuldade_locomocao": None,
                    "alteracoes_posturais": None,
                    "fraturas": None,
                    "outro": "Não informado",
                },
                "pele": {
                    "prurido": None,
                    "ectoparasitas": None,
                    "queda_de_pelo": None,
                    "alopecia": None,
                    "outro": "Não informado",
                },
                "olhos": {
                    "secrecao_ocular": None,
                    "deficit_visual": None,
                    "prurido": None,
                    "outro": "Não informado",
                },
                "ouvido": {
                    "prurido": None,
                    "secrecao": None,
                    "outro": "Não informado",
                },
                "ambiente": {
                    "rural": None,
                    "urbano": None,
                    "acesso_a_rua": None,
                    "outro": "Não informado",
                },
                "contactantes": "Não informado",
                "produtos_toxicos": "Não informado",
            },

            "alimentacao": {
                "racao_e_petiscos": {
                    "racao_seca_comercial": None,
                    "racao_umida_comercial": None,
                    "oferece_petiscos": None,
                },
                "alimentacao_natural": {
                    "crua_com_ossos": None,
                    "crua_sem_ossos": None,
                    "cozida": None,
                },
                "observacoes": "Não informado",
            },

            "exame_fisico": {
                "temperatura": "Não informado",
                "frequencia_cardiaca": "Não informado",
                "frequencia_respiratoria": "Não informado",
                "mucosas": "Não informado",
                "hidratacao": "Não informado",
                "linfonodos": "Não informado",
                "ausculta": "Não informado",
                "dor": "Não informado",
                "observacoes": "Não informado",
            },

            "suspeita_clinica_ou_diagnostico": "Não informado",
            "conduta_realizada": "Não informado",
            "prescricao": "Não informado",
            "orientacoes_ao_tutor": "Não informado",
            "retorno": "Não informado",
            "observacoes_gerais": "Erro ao estruturar com Ollama.",

            # Campos antigos
            "resumo": texto_transcrito,
            "diagnostico": "Não foi possível extrair estruturadamente.",
            "tratamento": "Não foi possível extrair estruturadamente.",
        }