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
- Se uma informação não estiver presente na transcrição, escreva "N/A", porem em na parte de IDENTIFICAÇÃO, EXAME FÍSICO e VETERINÁRIO caso não seja informado escreva "Não informado".
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
      "alteracao_apetite": null,
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
- Em campos de texto, escreva "N/A" quando a informação não aparecer, porem em na parte de IDENTIFICAÇÃO caso não seja informado escreva "Não informado".
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
                "alteracao_apetite, ingestão hídrica, urina, fezes, vômito, diarreia, tosse, "
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

def texto_ou_nao_informado(valor):
    if valor is None:
        return "N/A"

    if isinstance(valor, str):
        valor = valor.strip()
        if valor == "":
            return "N/A"
        return valor

    return str(valor)


def montar_lista_sinais(campos: dict, mapa_labels: dict) -> str:
    sinais = []

    for chave, label in mapa_labels.items():
        valor = campos.get(chave)

        if valor is True:
            sinais.append(f"- {label}")

    outro = campos.get("outro", "")

    if isinstance(outro, str) and outro.strip():
        sinais.append(f"- {outro.strip()}")

    if not sinais:
        return "N/A"

    return "\n".join(sinais)

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

    texto_doencas_pregressas = texto_ou_nao_informado(
        doencas_pregressas.get("descricao")
    )

    texto_sistema_digestorio = montar_lista_sinais(
        sistema_digestorio,
        {
            "vomito": "Vômito",
            "regurgitacao": "Regurgitação",
            "diarreia": "Diarreia",
            "alteracao_apetite": "Alteração de apetite ",
            "ingestao_de_agua": " Alteração na ingestão de água",
        }
    )

    texto_sistema_urogenital = montar_lista_sinais(
        sistema_urogenital,
        {
            "urina_normal": "Urina normal",
            "volume": "Alteração no volume urinário",
            "dificuldade_miccao": "Dificuldade de micção",
            "secrecao_vaginal": "Secreção vaginal",
            "castrado": "Castrado",
        }
    )

    texto_sistema_cardiorrespiratorio = montar_lista_sinais(
        sistema_cardiorrespiratorio,
        {
            "tosse": "Tosse",
            "cansaco_respiratorio": "Cansaço respiratório",
            "secrecao_nasal": "Secreção nasal",
        }
    )

    texto_sistema_neurologico = montar_lista_sinais(
        sistema_neurologico,
        {
            "convulsao": "Convulsão",
            "inclinacao_cabeca": "Inclinação de cabeça",
            "ataxia": "Ataxia",
        }
    )

    texto_sistema_locomotor = montar_lista_sinais(
        sistema_locomotor,
        {
            "dificuldade_locomocao": "Dificuldade de locomoção",
            "alteracoes_posturais": "Alterações posturais",
            "fraturas": "Fraturas",
        }
    )

    texto_pele = montar_lista_sinais(
        pele,
        {
            "prurido": "Prurido",
            "ectoparasitas": "Ectoparasitas",
            "queda_de_pelo": "Queda de pelo",
            "alopecia": "Alopecia",
        }
    )

    texto_olhos = montar_lista_sinais(
        olhos,
        {
            "secrecao_ocular": "Secreção ocular",
            "deficit_visual": "Déficit visual",
            "prurido": "Prurido ocular",
        }
    )

    texto_ouvido = montar_lista_sinais(
        ouvido,
        {
            "prurido": "Prurido auricular",
            "secrecao": "Secreção auricular",
        }
    )

    texto_ambiente = montar_lista_sinais(
        ambiente,
        {
            "rural": "Ambiente rural",
            "urbano": "Ambiente urbano",
            "acesso_a_rua": "Acesso à rua",
        }
    )

    texto_racao_petiscos = montar_lista_sinais(
        racao_e_petiscos,
        {
            "racao_seca_comercial": "Ração seca comercial",
            "racao_umida_comercial": "Ração úmida comercial",
            "oferece_petiscos": "Oferece petiscos",
        }
    )

    texto_alimentacao_natural = montar_lista_sinais(
        alimentacao_natural,
        {
            "crua_com_ossos": "Alimentação crua com ossos",
            "crua_sem_ossos": "Alimentação crua sem ossos",
            "cozida": "Alimentação cozida",
        }
    )

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
            "N/A"
        ),

        "anamnese": {
            "doencas_pregressas": {
                "sim": validar_bool(doencas_pregressas.get("sim")),
                "nao": validar_bool(doencas_pregressas.get("nao")),
                "descricao": doencas_pregressas.get("descricao", "N/A"),
            },
            "sistema_digestorio": {
                "vomito": validar_bool(sistema_digestorio.get("vomito")),
                "regurgitacao": validar_bool(sistema_digestorio.get("regurgitacao")),
                "diarreia": validar_bool(sistema_digestorio.get("diarreia")),
                "alteracao_apetite": validar_bool(sistema_digestorio.get("alteracao_apetite")),
                "ingestao_de_agua": validar_bool(sistema_digestorio.get("ingestao_de_agua")),
                "outro": sistema_digestorio.get("outro", "N/A"),
            },
            "sistema_urogenital": {
                "urina_normal": validar_bool(sistema_urogenital.get("urina_normal")),
                "volume": validar_bool(sistema_urogenital.get("volume")),
                "dificuldade_miccao": validar_bool(sistema_urogenital.get("dificuldade_miccao")),
                "secrecao_vaginal": validar_bool(sistema_urogenital.get("secrecao_vaginal")),
                "castrado": validar_bool(sistema_urogenital.get("castrado")),
                "outro": sistema_urogenital.get("outro", "N/A"),
            },
            "sistema_cardiorrespiratorio": {
                "tosse": validar_bool(sistema_cardiorrespiratorio.get("tosse")),
                "cansaco_respiratorio": validar_bool(sistema_cardiorrespiratorio.get("cansaco_respiratorio")),
                "secrecao_nasal": validar_bool(sistema_cardiorrespiratorio.get("secrecao_nasal")),
                "outro": sistema_cardiorrespiratorio.get("outro", "N/A"),
            },
            "sistema_neurologico": {
                "convulsao": validar_bool(sistema_neurologico.get("convulsao")),
                "inclinacao_cabeca": validar_bool(sistema_neurologico.get("inclinacao_cabeca")),
                "ataxia": validar_bool(sistema_neurologico.get("ataxia")),
                "outro": sistema_neurologico.get("outro", "N/A"),
            },
            "sistema_locomotor": {
                "dificuldade_locomocao": validar_bool(sistema_locomotor.get("dificuldade_locomocao")),
                "alteracoes_posturais": validar_bool(sistema_locomotor.get("alteracoes_posturais")),
                "fraturas": validar_bool(sistema_locomotor.get("fraturas")),
                "outro": sistema_locomotor.get("outro", "N/A"),
            },
            "pele": {
                "prurido": validar_bool(pele.get("prurido")),
                "ectoparasitas": validar_bool(pele.get("ectoparasitas")),
                "queda_de_pelo": validar_bool(pele.get("queda_de_pelo")),
                "alopecia": validar_bool(pele.get("alopecia")),
                "outro": pele.get("outro", "N/A"),
            },
            "olhos": {
                "secrecao_ocular": validar_bool(olhos.get("secrecao_ocular")),
                "deficit_visual": validar_bool(olhos.get("deficit_visual")),
                "prurido": validar_bool(olhos.get("prurido")),
                "outro": olhos.get("outro", "N/A"),
            },
            "ouvido": {
                "prurido": validar_bool(ouvido.get("prurido")),
                "secrecao": validar_bool(ouvido.get("secrecao")),
                "outro": ouvido.get("outro", "N/A"),
            },
            "ambiente": {
                "rural": validar_bool(ambiente.get("rural")),
                "urbano": validar_bool(ambiente.get("urbano")),
                "acesso_a_rua": validar_bool(ambiente.get("acesso_a_rua")),
                "outro": ambiente.get("outro", "N/A"),
            },
            "contactantes": anamnese.get("contactantes", "N/A"),
            "produtos_toxicos": anamnese.get("produtos_toxicos", "N/A"),
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
            "observacoes": alimentacao.get("observacoes", "N/A"),
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
            "N/A"
        ),
        "conduta_realizada": dados.get("conduta_realizada", "N/A"),
        "prescricao": dados.get("prescricao", "N/A"),
        "orientacoes_ao_tutor": dados.get("orientacoes_ao_tutor", "N/A"),
        "retorno": dados.get("retorno", "N/A"),
        "observacoes_gerais": dados.get("observacoes_gerais", "N/A"),

        "resumo": f"""
        IDENTIFICAÇÃO
        Tutor: {texto_ou_nao_informado(identificacao.get("tutor"))}
        Paciente: {texto_ou_nao_informado(identificacao.get("paciente"))}
        Espécie: {texto_ou_nao_informado(identificacao.get("especie"))}
        Raça: {texto_ou_nao_informado(identificacao.get("raca"))}
        Sexo: {texto_ou_nao_informado(identificacao.get("sexo"))}
        Idade: {texto_ou_nao_informado(identificacao.get("idade"))}
        Peso: {texto_ou_nao_informado(identificacao.get("peso"))}

        QUEIXA PRINCIPAL | HISTÓRICO RECENTE
        {texto_ou_nao_informado(dados.get("queixa_principal_historico_recente"))}

        ANAMNESE

        Doenças pregressas:
        {texto_doencas_pregressas}

        Sistema digestório:
        {texto_sistema_digestorio}

        Sistema urogenital:
        {texto_sistema_urogenital}

        Sistema cardiorrespiratório:
        {texto_sistema_cardiorrespiratorio}

        Sistema neurológico:
        {texto_sistema_neurologico}

        Sistema locomotor:
        {texto_sistema_locomotor}

        Pele:
        {texto_pele}

        Olhos:
        {texto_olhos}

        Ouvido:
        {texto_ouvido}

        Ambiente:
        {texto_ambiente}

        Contactantes:
        {texto_ou_nao_informado(anamnese.get("contactantes"))}

        Produtos tóxicos:
        {texto_ou_nao_informado(anamnese.get("produtos_toxicos"))}

        ALIMENTAÇÃO

        Ração e petiscos:
        {texto_racao_petiscos}

        Alimentação natural:
        {texto_alimentacao_natural}

        Observações:
        {texto_ou_nao_informado(alimentacao.get("observacoes"))}

        EXAME FÍSICO

        Temperatura: {texto_ou_nao_informado(exame_fisico.get("temperatura"))}
        Frequência cardíaca: {texto_ou_nao_informado(exame_fisico.get("frequencia_cardiaca"))}
        Frequência respiratória: {texto_ou_nao_informado(exame_fisico.get("frequencia_respiratoria"))}
        Mucosas: {texto_ou_nao_informado(exame_fisico.get("mucosas"))}
        Hidratação: {texto_ou_nao_informado(exame_fisico.get("hidratacao"))}
        Linfonodos: {texto_ou_nao_informado(exame_fisico.get("linfonodos"))}
        Ausculta: {texto_ou_nao_informado(exame_fisico.get("ausculta"))}
        Dor: {texto_ou_nao_informado(exame_fisico.get("dor"))}
        Observações: {texto_ou_nao_informado(exame_fisico.get("observacoes"))}
        """.strip(),

        "diagnostico": dados.get(
            "suspeita_clinica_ou_diagnostico",
            dados.get("diagnostico", "N/A")
        ),

        "tratamento": f"""
        CONDUTA REALIZADA
        {dados.get("conduta_realizada", "N/A")}

        PRESCRIÇÃO
        {dados.get("prescricao", "N/A")}

        ORIENTAÇÕES AO TUTOR
        {dados.get("orientacoes_ao_tutor", "N/A")}

        RETORNO
        {dados.get("retorno", "N/A")}

        OBSERVAÇÕES GERAIS
        {dados.get("observacoes_gerais", "N/A")}
        """.strip(),
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
            "ficha_prontuario_numero": "N/A",

            "identificacao": {
                "tutor": "N/A",
                "paciente": "N/A",
                "idade": "N/A",
                "sexo": "N/A",
                "raca": "N/A",
                "especie": "N/A",
                "peso": "N/A",
            },

            "queixa_principal_historico_recente": texto_transcrito,

            "anamnese": {
                "doencas_pregressas": {
                    "sim": None,
                    "nao": None,
                    "descricao": "N/A",
                },
                "sistema_digestorio": {
                    "vomito": None,
                    "regurgitacao": None,
                    "diarreia": None,
                    "alteracao_apetite": None,
                    "ingestao_de_agua": None,
                    "outro": "N/A",
                },
                "sistema_urogenital": {
                    "urina_normal": None,
                    "volume": None,
                    "dificuldade_miccao": None,
                    "secrecao_vaginal": None,
                    "castrado": None,
                    "outro": "N/A",
                },
                "sistema_cardiorrespiratorio": {
                    "tosse": None,
                    "cansaco_respiratorio": None,
                    "secrecao_nasal": None,
                    "outro": "N/A",
                },
                "sistema_neurologico": {
                    "convulsao": None,
                    "inclinacao_cabeca": None,
                    "ataxia": None,
                    "outro": "N/A",
                },
                "sistema_locomotor": {
                    "dificuldade_locomocao": None,
                    "alteracoes_posturais": None,
                    "fraturas": None,
                    "outro": "N/A",
                },
                "pele": {
                    "prurido": None,
                    "ectoparasitas": None,
                    "queda_de_pelo": None,
                    "alopecia": None,
                    "outro": "N/A",
                },
                "olhos": {
                    "secrecao_ocular": None,
                    "deficit_visual": None,
                    "prurido": None,
                    "outro": "N/A",
                },
                "ouvido": {
                    "prurido": None,
                    "secrecao": None,
                    "outro": "N/A",
                },
                "ambiente": {
                    "rural": None,
                    "urbano": None,
                    "acesso_a_rua": None,
                    "outro": "N/A",
                },
                "contactantes": "N/A",
                "produtos_toxicos": "N/A",
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
                "observacoes": "N/A",
            },

            "exame_fisico": {
                "temperatura": "N/A",
                "frequencia_cardiaca": "N/A",
                "frequencia_respiratoria": "N/A",
                "mucosas": "N/A",
                "hidratacao": "N/A",
                "linfonodos": "N/A",
                "ausculta": "N/A",
                "dor": "N/A",
                "observacoes": "N/A",
            },

            "suspeita_clinica_ou_diagnostico": "N/A",
            "conduta_realizada": "N/A",
            "prescricao": "N/A",
            "orientacoes_ao_tutor": "N/A",
            "retorno": "N/A",
            "observacoes_gerais": "Erro ao estruturar com Ollama.",

            # Campos antigos
            "resumo": texto_transcrito,
            "diagnostico": "Não foi possível extrair estruturadamente.",
            "tratamento": "Não foi possível extrair estruturadamente.",
        }