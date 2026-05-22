import json
from ia_service import estruturar_prontuario
from database import SessionLocal
from models import Cliente, Pet, Prontuario

# Um texto de exemplo simulando uma consulta veterinária
texto_teste = """
A tutora Maria trouxe o paciente Rex, um cachorro poodle de 5 anos, pesando 7kg.
Ela relatou que o Rex está com diarreia e vomitando desde ontem, além de não querer comer a ração seca de costume. 
A urina parece normal, mas ele está bem mais quieto. Nenhuma tosse ou espirro.
No exame clínico, a temperatura dele estava em 39.2 (levemente febril), mucosas um pouco hipocoradas e parece levemente desidratado. 
A suspeita clínica é de uma gastroenterite. 
Como conduta, fizemos fluidoterapia no consultório, apliquei antiemético e prescrevi um probiótico para tomar em casa por 5 dias. 
Foi orientada a oferecer alimentação úmida e retornar caso ele não melhore.
"""

print("Enviando texto de teste para o LLM pelo Ollama...")
try:
    dados = estruturar_prontuario(texto_teste)
    print("\n✅ Resposta do LLM gerada com sucesso!\n")
    # print(json.dumps(dados, indent=2, ensure_ascii=False))

    print("Tentando salvar no banco de dados...")
    db = SessionLocal()

    # Busca um pet existente para associar
    pet = db.query(Pet).first()

    if not pet:
        print("Criando Cliente e Pet de teste, pois o banco estava vazio...")
        cliente = Cliente(nome="Maria (Teste)")
        db.add(cliente)
        db.commit()
        db.refresh(cliente)

        pet = Pet(nome="Rex", especie="Cachorro", cliente_id=cliente.id)
        db.add(pet)
        db.commit()
        db.refresh(pet)

    novo_prontuario = Prontuario(
        pet_id=pet.id,
        tipo="Consulta de Avaliação (Teste)",
        veterinario="Dra. Teste LLM",
        resumo=dados.get("resumo"),
        diagnostico=dados.get("diagnostico"),
        tratamento=dados.get("tratamento"),
    )

    db.add(novo_prontuario)
    db.commit()
    db.refresh(novo_prontuario)

    print(
        f"\n🎉 Prontuário salvo com sucesso no banco de dados! ID do prontuário: {novo_prontuario.id}")
    print("Agora você pode ligar sua aplicação novamente e ver o prontuário no histórico do pet!")
    db.close()

except Exception as e:
    print(f"\n❌ Erro: {e}")
