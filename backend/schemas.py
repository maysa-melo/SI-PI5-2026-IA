from pydantic import BaseModel
from typing import Optional
from datetime import date
from decimal import Decimal
from datetime import datetime

class ClienteCreate(BaseModel):
    nome: str
    sexo: Optional[str] = None
    nacionalidade: Optional[str] = None
    estado_civil: Optional[str] = None
    cpf: Optional[str] = None
    rg: Optional[str] = None
    data_nascimento: Optional[date] = None
    profissao: Optional[str] = None
    como_conheceu: Optional[str] = None
    matricula_convenio: Optional[str] = None
    email: Optional[str] = None
    facebook: Optional[str] = None
    instagram: Optional[str] = None
    marcacao_neutra: Optional[str] = None
    marcacao_positiva: Optional[str] = None
    foto_url: Optional[str] = None

class ClienteResponse(ClienteCreate):
    id: int

    class Config:
        from_attributes = True

class PetCreate(BaseModel):
    cliente_id: int
    nome: str
    especie: str
    raca: Optional[str] = None
    vivo: Optional[bool] = True
    peso_kg: Optional[Decimal] = None
    data_nascimento: Optional[date] = None
    sexo: Optional[str] = None
    castrado: Optional[bool] = None
    porte: Optional[str] = None
    cor: Optional[str] = None
    pelagem: Optional[str] = None
    pedigree: Optional[str] = None
    chip: Optional[str] = None
    matricula_convenio: Optional[str] = None
    foto_url: Optional[str] = None

class PetResponse(PetCreate):
    id: int

    class Config:
        from_attributes = True

class ClienteUpdate(BaseModel):
    nome: Optional[str] = None
    sexo: Optional[str] = None
    nacionalidade: Optional[str] = None
    estado_civil: Optional[str] = None
    cpf: Optional[str] = None
    rg: Optional[str] = None
    data_nascimento: Optional[date] = None
    profissao: Optional[str] = None
    como_conheceu: Optional[str] = None
    matricula_convenio: Optional[str] = None
    email: Optional[str] = None
    facebook: Optional[str] = None
    instagram: Optional[str] = None
    marcacao_neutra: Optional[str] = None
    marcacao_positiva: Optional[str] = None
    foto_url: Optional[str] = None

class PetUpdate(BaseModel):
    cliente_id: Optional[int] = None
    nome: Optional[str] = None
    especie: Optional[str] = None
    raca: Optional[str] = None
    vivo: Optional[bool] = None
    peso_kg: Optional[Decimal] = None
    data_nascimento: Optional[date] = None
    sexo: Optional[str] = None
    castrado: Optional[bool] = None
    porte: Optional[str] = None
    cor: Optional[str] = None
    pelagem: Optional[str] = None
    pedigree: Optional[str] = None
    chip: Optional[str] = None
    matricula_convenio: Optional[str] = None
    foto_url: Optional[str] = None
class ProntuarioCreate(BaseModel):
    pet_id: int
    tipo: Optional[str] = None
    veterinario: Optional[str] = None
    resumo: Optional[str] = None
    diagnostico: Optional[str] = None
    tratamento: Optional[str] = None

class ProntuarioResponse(ProntuarioCreate):
    id: int
    criado_em: datetime

    class Config:
        from_attributes = True

class ProntuarioUpdate(BaseModel):
    tipo: Optional[str] = None
    veterinario: Optional[str] = None
    resumo: Optional[str] = None
    diagnostico: Optional[str] = None
    tratamento: Optional[str] = None

class VeterinarioCreate(BaseModel):
    nome: str
    email: str
    senha: str
    crmv: Optional[str] = None
    ativo: Optional[bool] = True

class VeterinarioResponse(BaseModel):
    id: int
    nome: str
    email: str
    crmv: Optional[str] = None
    ativo: bool
    criado_em: datetime

class Config:
    from_attributes = True

class LoginRequest(BaseModel):
    email: str
    senha: str

class LoginResponse(BaseModel):
    mensagem: str
    veterinario: VeterinarioResponse