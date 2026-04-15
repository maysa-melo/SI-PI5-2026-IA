from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
import bcrypt

from database import engine, SessionLocal
from models import Cliente, Pet, Prontuario, Veterinario
from schemas import (
    ClienteCreate, ClienteResponse, ClienteUpdate,
    PetCreate, PetResponse, PetUpdate,
    ProntuarioCreate, ProntuarioResponse, ProntuarioUpdate,
    VeterinarioCreate, VeterinarioResponse,
    LoginRequest, LoginResponse
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

def gerar_hash_senha(senha: str) -> str:
    salt = bcrypt.gensalt()
    senha_hash = bcrypt.hashpw(senha.encode("utf-8"), salt)
    return senha_hash.decode("utf-8")

def verificar_senha(senha: str, senha_hash: str) -> bool:
    return bcrypt.checkpw(senha.encode("utf-8"), senha_hash.encode("utf-8"))

@app.get("/")
def home():
    return {"mensagem": "Backend rodando com sucesso"}

@app.get("/db-check")
def db_check():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        return {"database": "conectado", "resultado": result.scalar()}

# =========================
# VETERINÁRIOS / AUTH
# =========================

@app.post("/veterinarios", response_model=VeterinarioResponse)
def criar_veterinario(veterinario: VeterinarioCreate, db: Session = Depends(get_db)):
    veterinario_existente = db.query(Veterinario).filter(Veterinario.email == veterinario.email).first()
    if veterinario_existente:
        raise HTTPException(status_code=400, detail="Já existe um veterinário com esse e-mail")

    novo_veterinario = Veterinario(
        nome=veterinario.nome,
        email=veterinario.email,
        senha_hash=gerar_hash_senha(veterinario.senha),
        crmv=veterinario.crmv,
        ativo=veterinario.ativo if veterinario.ativo is not None else True
    )

    db.add(novo_veterinario)
    db.commit()
    db.refresh(novo_veterinario)
    return novo_veterinario

@app.get("/veterinarios", response_model=list[VeterinarioResponse])
def listar_veterinarios(db: Session = Depends(get_db)):
    return db.query(Veterinario).all()

@app.post("/auth/login", response_model=LoginResponse)
def login(dados: LoginRequest, db: Session = Depends(get_db)):
    veterinario = db.query(Veterinario).filter(Veterinario.email == dados.email).first()

    if not veterinario:
        raise HTTPException(status_code=401, detail="E-mail ou senha inválidos")

    if not veterinario.ativo:
        raise HTTPException(status_code=403, detail="Usuário inativo")

    if not verificar_senha(dados.senha, veterinario.senha_hash):
        raise HTTPException(status_code=401, detail="E-mail ou senha inválidos")

    return {
        "mensagem": "Login realizado com sucesso",
        "veterinario": veterinario
    }

# =========================
# CLIENTES
# =========================

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

@app.get("/clientes/{cliente_id}", response_model=ClienteResponse)
def buscar_cliente(cliente_id: int, db: Session = Depends(get_db)):
    cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return cliente

@app.put("/clientes/{cliente_id}", response_model=ClienteResponse)
def atualizar_cliente(cliente_id: int, dados: ClienteUpdate, db: Session = Depends(get_db)):
    cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")

    for chave, valor in dados.dict(exclude_unset=True).items():
        setattr(cliente, chave, valor)

    db.commit()
    db.refresh(cliente)
    return cliente

@app.delete("/clientes/{cliente_id}")
def deletar_cliente(cliente_id: int, db: Session = Depends(get_db)):
    cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")

    db.delete(cliente)
    db.commit()
    return {"mensagem": "Cliente deletado com sucesso"}

# =========================
# PETS
# =========================

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

@app.get("/pets/{pet_id}", response_model=PetResponse)
def buscar_pet(pet_id: int, db: Session = Depends(get_db)):
    pet = db.query(Pet).filter(Pet.id == pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet não encontrado")
    return pet

@app.put("/pets/{pet_id}", response_model=PetResponse)
def atualizar_pet(pet_id: int, dados: PetUpdate, db: Session = Depends(get_db)):
    pet = db.query(Pet).filter(Pet.id == pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet não encontrado")

    for chave, valor in dados.dict(exclude_unset=True).items():
        setattr(pet, chave, valor)

    db.commit()
    db.refresh(pet)
    return pet

@app.delete("/pets/{pet_id}")
def deletar_pet(pet_id: int, db: Session = Depends(get_db)):
    pet = db.query(Pet).filter(Pet.id == pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet não encontrado")

    db.delete(pet)
    db.commit()
    return {"mensagem": "Pet deletado com sucesso"}

@app.get("/clientes/{cliente_id}/pets", response_model=list[PetResponse])
def listar_pets_do_cliente(cliente_id: int, db: Session = Depends(get_db)):
    return db.query(Pet).filter(Pet.cliente_id == cliente_id).all()

# =========================
# PRONTUÁRIOS
# =========================

@app.post("/prontuarios", response_model=ProntuarioResponse)
def criar_prontuario(prontuario: ProntuarioCreate, db: Session = Depends(get_db)):
    novo_prontuario = Prontuario(**prontuario.dict())
    db.add(novo_prontuario)
    db.commit()
    db.refresh(novo_prontuario)
    return novo_prontuario

@app.get("/prontuarios", response_model=list[ProntuarioResponse])
def listar_prontuarios(db: Session = Depends(get_db)):
    return db.query(Prontuario).all()

@app.get("/prontuarios/{prontuario_id}", response_model=ProntuarioResponse)
def buscar_prontuario(prontuario_id: int, db: Session = Depends(get_db)):
    prontuario = db.query(Prontuario).filter(Prontuario.id == prontuario_id).first()
    if not prontuario:
        raise HTTPException(status_code=404, detail="Prontuário não encontrado")
    return prontuario

@app.get("/pets/{pet_id}/prontuarios", response_model=list[ProntuarioResponse])
def listar_prontuarios_do_pet(pet_id: int, db: Session = Depends(get_db)):
    return db.query(Prontuario).filter(Prontuario.pet_id == pet_id).order_by(Prontuario.id.desc()).all()

@app.put("/prontuarios/{prontuario_id}", response_model=ProntuarioResponse)
def atualizar_prontuario(prontuario_id: int, dados: ProntuarioUpdate, db: Session = Depends(get_db)):
    prontuario = db.query(Prontuario).filter(Prontuario.id == prontuario_id).first()
    if not prontuario:
        raise HTTPException(status_code=404, detail="Prontuário não encontrado")

    for chave, valor in dados.dict(exclude_unset=True).items():
        setattr(prontuario, chave, valor)

    db.commit()
    db.refresh(prontuario)
    return prontuario

@app.delete("/prontuarios/{prontuario_id}")
def deletar_prontuario(prontuario_id: int, db: Session = Depends(get_db)):
    prontuario = db.query(Prontuario).filter(Prontuario.id == prontuario_id).first()
    if not prontuario:
        raise HTTPException(status_code=404, detail="Prontuário não encontrado")

    db.delete(prontuario)
    db.commit()
    return {"mensagem": "Prontuário deletado com sucesso"}