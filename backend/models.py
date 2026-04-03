from sqlalchemy import Column, Integer, String, Date, Text, TIMESTAMP, func, Boolean, Numeric, ForeignKey
from database import Base

class Cliente(Base):
    __tablename__ = "clientes"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(150), nullable=False)
    sexo = Column(String(30), nullable=True)
    nacionalidade = Column(String(60), nullable=True)
    estado_civil = Column(String(30), nullable=True)
    cpf = Column(String(14), unique=True, nullable=True)
    rg = Column(String(20), nullable=True)
    data_nascimento = Column(Date, nullable=True)
    profissao = Column(String(100), nullable=True)
    como_conheceu = Column(String(100), nullable=True)
    matricula_convenio = Column(String(50), nullable=True)
    email = Column(String(150), nullable=True)
    facebook = Column(String(150), nullable=True)
    instagram = Column(String(150), nullable=True)
    marcacao_neutra = Column(Text, nullable=True)
    marcacao_positiva = Column(Text, nullable=True)
    foto_url = Column(Text, nullable=True)
    criado_em = Column(TIMESTAMP, server_default=func.now())

class Pet(Base):
    __tablename__ = "pets"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id", ondelete="CASCADE"), nullable=False)
    nome = Column(String(100), nullable=False)
    especie = Column(String(50), nullable=False)
    raca = Column(String(100), nullable=True)
    vivo = Column(Boolean, default=True)
    peso_kg = Column(Numeric(6, 2), nullable=True)
    data_nascimento = Column(Date, nullable=True)
    sexo = Column(String(20), nullable=True)
    castrado = Column(Boolean, nullable=True)
    porte = Column(String(30), nullable=True)
    cor = Column(String(50), nullable=True)
    pelagem = Column(String(50), nullable=True)
    pedigree = Column(String(100), nullable=True)
    chip = Column(String(100), nullable=True)
    matricula_convenio = Column(String(50), nullable=True)
    foto_url = Column(Text, nullable=True)
    criado_em = Column(TIMESTAMP, server_default=func.now())