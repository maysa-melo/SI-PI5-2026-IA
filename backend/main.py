from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import engine, SessionLocal
from models import Cliente, Pet
from schemas import (
    ClienteCreate, ClienteResponse, ClienteUpdate,
    PetCreate, PetResponse, PetUpdate
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def home():
    return {"mensagem": "Backend rodando com sucesso"}

@app.get("/db-check")
def db_check():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        return {"database": "conectado", "resultado": result.scalar()}

@app.post("/clientes", response_model=ClienteResponse)
def criar_cliente(cliente: ClienteCreate, db: Session = Depends(get_db)):
    novo_cliente = Cliente(**cliente.dict())
    db.add(novo_cliente)
    db.commit()
    db.refresh(novo_cliente)
    return novo_cliente

@app.get("/clientes", response_model=list[ClienteResponse])
def listar_clientes(db: Session = Depends(get_db)):
    return db.query(Cliente).all()

@app.post("/pets", response_model=PetResponse)
def criar_pet(pet: PetCreate, db: Session = Depends(get_db)):
    novo_pet = Pet(**pet.dict())
    db.add(novo_pet)
    db.commit()
    db.refresh(novo_pet)
    return novo_pet

@app.get("/pets", response_model=list[PetResponse])
def listar_pets(db: Session = Depends(get_db)):
    return db.query(Pet).all()

@app.get("/clientes/{cliente_id}", response_model=ClienteResponse)
def buscar_cliente(cliente_id: int, db: Session = Depends(get_db)):
    cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not cliente:
        return {"erro": "Cliente não encontrado"}
    return cliente

@app.put("/clientes/{cliente_id}", response_model=ClienteResponse)
def atualizar_cliente(cliente_id: int, dados: ClienteUpdate, db: Session = Depends(get_db)):
    cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not cliente:
        return {"erro": "Cliente não encontrado"}

    for chave, valor in dados.dict(exclude_unset=True).items():
        setattr(cliente, chave, valor)

    db.commit()
    db.refresh(cliente)
    return cliente

@app.delete("/clientes/{cliente_id}")
def deletar_cliente(cliente_id: int, db: Session = Depends(get_db)):
    cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not cliente:
        return {"erro": "Cliente não encontrado"}

    db.delete(cliente)
    db.commit()
    return {"mensagem": "Cliente deletado com sucesso"}

@app.get("/pets/{pet_id}", response_model=PetResponse)
def buscar_pet(pet_id: int, db: Session = Depends(get_db)):
    pet = db.query(Pet).filter(Pet.id == pet_id).first()
    if not pet:
        return {"erro": "Pet não encontrado"}
    return pet

@app.put("/pets/{pet_id}", response_model=PetResponse)
def atualizar_pet(pet_id: int, dados: PetUpdate, db: Session = Depends(get_db)):
    pet = db.query(Pet).filter(Pet.id == pet_id).first()
    if not pet:
        return {"erro": "Pet não encontrado"}

    for chave, valor in dados.dict(exclude_unset=True).items():
        setattr(pet, chave, valor)

    db.commit()
    db.refresh(pet)
    return pet

@app.delete("/pets/{pet_id}")
def deletar_pet(pet_id: int, db: Session = Depends(get_db)):
    pet = db.query(Pet).filter(Pet.id == pet_id).first()
    if not pet:
        return {"erro": "Pet não encontrado"}

    db.delete(pet)
    db.commit()
    return {"mensagem": "Pet deletado com sucesso"}

@app.get("/clientes/{cliente_id}/pets", response_model=list[PetResponse])
def listar_pets_do_cliente(cliente_id: int, db: Session = Depends(get_db)):
    return db.query(Pet).filter(Pet.cliente_id == cliente_id).all()