# Schemas Pydantic (validação/serialização) do serviço de Consultas.
#
# Mantemos três variações usuais:
# - In: payload de criação
# - Atualizar: atualização parcial (PATCH)
# - Out: representação de saída (response)
#
# Observação sobre nomenclatura:
# O cliente pode enviar `cpfPaciente` (camelCase) e o backend trabalha com
# `cpf_paciente` (snake_case). Usamos `alias` do Pydantic para aceitar ambos,
# e retornamos no formato de alias por padrão nas responses.

from __future__ import annotations
from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Optional
from .validators import validar_cpf_formato


class ConsultaIn(BaseModel):
    # Dados necessários para criar uma consulta
    model_config = ConfigDict(populate_by_name=True)

    cpf_paciente: str = Field(
        alias="cpfPaciente", min_length=11, max_length=14, description="CPF do paciente"
    )
    dia: str = Field(min_length=8, max_length=10, description="Data da consulta (YYYY-MM-DD)")
    hora: str = Field(min_length=4, max_length=8, description="Hora da consulta (HH:MM)")
    descricao: str = Field(min_length=1, max_length=255)
    estado: Optional[str] = Field(default=None, max_length=40)
    observacoes: Optional[str] = Field(default=None, max_length=255)

    @field_validator("cpf_paciente")
    @classmethod
    def _valida_cpf(cls, v: str) -> str:
        return validar_cpf_formato(v)


class ConsultaAtualizar(BaseModel):
    # Atualização parcial de uma consulta existente. Envie apenas campos a alterar.
    model_config = ConfigDict(populate_by_name=True)

    cpf_paciente: Optional[str] = Field(
        default=None, alias="cpfPaciente", min_length=11, max_length=14
    )
    dia: Optional[str] = Field(default=None, min_length=8, max_length=10)
    hora: Optional[str] = Field(default=None, min_length=4, max_length=8)
    descricao: Optional[str] = Field(default=None, min_length=1, max_length=255)
    estado: Optional[str] = Field(default=None, max_length=40)
    observacoes: Optional[str] = Field(default=None, max_length=255)

    @field_validator("cpf_paciente")
    @classmethod
    def _valida_cpf(cls, v: str | None) -> str | None:
        if v is None:
            return v
        return validar_cpf_formato(v)


class ConsultaOut(BaseModel):
    # Representação de saída de uma consulta.
    # `from_attributes=True` permite retornar instâncias SQLAlchemy diretamente.
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int
    cpf_paciente: str = Field(alias="cpfPaciente")
    dia: str
    hora: str
    descricao: str
    estado: Optional[str] = None
    observacoes: Optional[str] = None
