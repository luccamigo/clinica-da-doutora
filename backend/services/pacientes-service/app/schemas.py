# Schemas Pydantic (validação/serialização) do serviço de Pacientes.
#
# Os schemas distinguem entrada (In), atualização parcial (Atualizar) e saída (Out).
# `model_config = ConfigDict(from_attributes=True)` habilita compatibilidade com ORM
# (similar ao antigo `orm_mode=True`), permitindo retornar instâncias SQLAlchemy.

from __future__ import annotations
from pydantic import BaseModel, Field, EmailStr, ConfigDict, field_validator
from typing import Optional, List
from .validators import validar_cpf_formato

# ========== CIRURGIA ==========
class CirurgiaIn(BaseModel):
    # Payload de criação de cirurgia (uso aninhado em PacienteIn).
    nome: str = Field(min_length=1, max_length=120)
    data: Optional[str] = Field(default=None, description="YYYY-MM-DD")
    observacoes: Optional[str] = Field(default=None, max_length=255)

class CirurgiaAtualizar(BaseModel):
    # Atualização parcial de cirurgia.
    nome: Optional[str] = Field(default=None, max_length=120)
    data: Optional[str] = Field(default=None, description="YYYY-MM-DD")
    observacoes: Optional[str] = Field(default=None, max_length=255)

class CirurgiaOut(BaseModel):
    # Representação de saída de cirurgia.
    model_config = ConfigDict(from_attributes=True)
    id: int
    paciente_cpf: str
    nome: str
    data: Optional[str] = None
    observacoes: Optional[str] = None

# ========== MEDICAÇÃO ==========
class MedicacaoIn(BaseModel):
    # Payload de criação de medicação (aninhado).
    nome: str = Field(min_length=1, max_length=120)
    dosagem: Optional[str] = Field(default=None, max_length=60)
    frequencia: Optional[str] = Field(default=None, max_length=60)

class MedicacaoAtualizar(BaseModel):
    # Atualização parcial de medicação.
    nome: Optional[str] = Field(default=None, max_length=120)
    dosagem: Optional[str] = Field(default=None, max_length=60)
    frequencia: Optional[str] = Field(default=None, max_length=60)


class MedicacaoOut(BaseModel):
    # Representação de saída de medicação.
    model_config = ConfigDict(from_attributes=True)
    id: int
    paciente_cpf: str
    nome: str
    dosagem: Optional[str] = None
    frequencia: Optional[str] = None


# ========== ALERGIA ==========
class AlergiaIn(BaseModel):
    # Payload de criação de alergia (aninhado).
    paciente_cpf: Optional[str] = Field(default=None, min_length=11, max_length=24)
    agente: str = Field(min_length=1, max_length=120)
    severidade: Optional[str] = Field(default=None, max_length=40)

    @field_validator("paciente_cpf")
    @classmethod
    def _valida_paciente_cpf(cls, v: str | None) -> str | None:
        if v is None:
            return v
        return validar_cpf_formato(v)

class AlergiaAtualizar(BaseModel):
    # Atualização parcial de alergia.
    agente: Optional[str] = Field(default=None, max_length=120)
    severidade: Optional[str] = Field(default=None, max_length=40)

class AlergiaOut(BaseModel):
    # Representação de saída de alergia.
    model_config = ConfigDict(from_attributes=True)
    id: int
    paciente_cpf: str
    agente: str
    severidade: Optional[str] = None

# ========== PACIENTES ==========

class PacienteIn(BaseModel):
    # Payload de criação de paciente.
    # Inclui dados básicos e coleções aninhadas opcionais (cirurgia, medicação,
    # alergia), permitindo o cadastro completo em uma única requisição.
    cpf: str = Field(min_length=11, max_length=14)
    nome_completo: str = Field(min_length=3, max_length=150)
    data_nascimento: Optional[str] = Field(default=None, description="YYYY-MM-DD")
    telefone: Optional[str] = None
    email: Optional[EmailStr] = None
    # Se houver um responsável já existente, informe o CPF dele:
    responsavel_cpf: Optional[str] = Field(default=None, min_length=11, max_length=14)

    cirurgia: Optional[List[CirurgiaIn]] = None
    medicacao: Optional[List[MedicacaoIn]] = None
    alergia: Optional[List[AlergiaIn]] = None

    @field_validator("cpf", "responsavel_cpf")
    @classmethod
    def _valida_cpfs(cls, v: str | None) -> str | None:
        if v is None:
            return v
        return validar_cpf_formato(v)


class PacienteAtualizar(BaseModel):
    # Atualização parcial (PATCH) do paciente.
    # Somente os campos enviados serão considerados, mantendo os demais.
    # update “completo” (MVP), se preferir faça campos todos opcionais
    nome_completo: Optional[str] = Field(default=None, min_length=3, max_length=150)
    data_nascimento: Optional[str] = Field(default=None, description="YYYY-MM-DD")
    telefone: Optional[str] = None
    email: Optional[EmailStr] = None
    responsavel_cpf: Optional[str] = Field(default=None, min_length=11, max_length=14)

    cirurgia: Optional[List[CirurgiaAtualizar]] = None
    medicacao: Optional[List[MedicacaoAtualizar]] = None
    alergia: Optional[List[AlergiaAtualizar]] = None

    @field_validator("responsavel_cpf")
    @classmethod
    def _valida_responsavel(cls, v: str | None) -> str | None:
        if v is None:
            return v
        return validar_cpf_formato(v)

class PacienteOut(BaseModel):
    # Representação de saída completa do paciente (com coleções).
    model_config = ConfigDict(from_attributes=True)
    cpf: str = Field(min_length=11, max_length=14)
    nome_completo: str = Field(min_length=3, max_length=150)
    data_nascimento: Optional[str] = Field(default=None, description="YYYY-MM-DD")
    telefone: Optional[str] = None
    email: Optional[EmailStr] = None
    # Se houver um responsável já existente, informe o CPF dele:
    responsavel_cpf: Optional[str] = Field(default=None, min_length=11, max_length=14)

    cirurgias: List[CirurgiaOut] = Field(default_factory=list)
    medicacoes: List[MedicacaoOut] = Field(default_factory=list)
    alergias: List[AlergiaOut] = Field(default_factory=list)

class PacienteOutLeve(BaseModel):
    # Representação enxuta para consultas rápidas (sem coleções).
    model_config = ConfigDict(from_attributes=True)
    cpf: str
    nome_completo: str
    data_nascimento: Optional[str] = None
