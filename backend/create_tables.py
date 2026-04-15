from database import engine, Base
from models import Cliente, Pet, Prontuario, Veterinario

print("Criando tabelas...")
Base.metadata.create_all(bind=engine)
print("Tabelas criadas com sucesso.")