from __future__ import annotations
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional, List

# ========== CIRURGIA ==========
class CirurgiaIn(BaseModel):
    nome: str = Field(min_length=1, max_length=120)
    data: Optional[str] = Field(default=None, description="YYYY-MM-DD")
    observacoes: Optional[str] = Field(default=None, max_length=255)

class CirurgiaAtualizar(BaseModel):
    nome: Optional[str] = Field(default=None, max_length=120)
    data: Optional[str] = Field(default=None, description="YYYY-MM-DD")
    observacoes: Optional[str] = Field(default=None, max_length=255)

class CirurgiaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    paciente_cpf: str
    nome: str
    data: Optional[str] = None
    observacoes: Optional[str] = None

# ========== MEDICAÇÃO ==========
class MedicacaoIn(BaseModel):
    nome: str = Field(min_length=1, max_length=120)
    dosagem: Optional[str] = Field(default=None, max_length=60)
    frequencia: Optional[str] = Field(default=None, max_length=60)

class MedicacaoAtualizar(BaseModel):
    nome: Optional[str] = Field(default=None, max_length=120)
    dosagem: Optional[str] = Field(default=None, max_length=60)
    frequencia: Optional[str] = Field(default=None, max_length=60)


class MedicacaoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    paciente_cpf: str
    nome: str
    dosagem: Optional[str] = None
    frequencia: Optional[str] = None


# ========== ALERGIA ==========
class AlergiaIn(BaseModel):
    paciente_cpf: str = Field(min_length=11, max_length=24)
    agente: str = Field(min_length=1, max_length=120)
    severidade: Optional[str] = Field(default=None, max_length=40)

class AlergiaAtualizar(BaseModel):
    agente: Optional[str] = Field(default=None, max_length=120)
    severidade: Optional[str] = Field(default=None, max_length=40)

class AlergiaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    paciente_cpf: str
    agente: str
    severidade: Optional[str] = None

# ========== PACIENTES ==========

class PacienteIn(BaseModel):
    cpf: str = Field(min_length=11, max_length=14)
    nome_completo: str = Field(min_length=3, max_length=150)
    data_nascimento: Optional[str] = Field(default=None, description="YYYY-MM-DD")
    telefone: Optional[str] = None
    email: Optional[EmailStr] = None
    # Se houver um responsável já existente, informe o CPF dele:
    responsavel_cpf: Optional[str] = Field(default=None, min_length=11, max_length=14)

    cirurgias: Optional[List[CirurgiaIn]] = None
    medicacoes: Optional[List[MedicacaoIn]] = None
    alergias: Optional[List[AlergiaIn]] = None


class PacienteAtualizar(BaseModel):
    # update “completo” (MVP), se preferir faça campos todos opcionais
    nome_completo: Optional[str] = Field(min_length=3, max_length=150)
    data_nascimento: Optional[str] = Field(default=None, description="YYYY-MM-DD")
    telefone: Optional[str] = None
    email: Optional[EmailStr] = None
    responsavel_cpf: Optional[str] = Field(default=None, min_length=11, max_length=14)

class PacienteOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    cpf: str = Field(min_length=11, max_length=14)
    nome_completo: str = Field(min_length=3, max_length=150)
    data_nascimento: Optional[str] = Field(default=None, description="YYYY-MM-DD")
    telefone: Optional[str] = None
    email: Optional[EmailStr] = None
    # Se houver um responsável já existente, informe o CPF dele:
    responsavel_cpf: Optional[str] = Field(default=None, min_length=11, max_length=14)

    cirurgias: List[CirurgiaOut] = []
    medicacoes: List[MedicacaoOut] = []
    alergias: List[AlergiaOut] = []

class PacienteOutLeve(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    cpf: str
    nome_completo: str
    data_nascimento: Optional[str] = None
    telefone: Optional[str] = None
    responsavel_cpf: Optional[str] = None