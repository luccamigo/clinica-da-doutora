"""Modelos SQLAlchemy do serviço de Consultas.

Define o mapeamento ORM para a entidade `Consulta`. Como este é um
microsserviço independente, não há FK direta para pacientes (em outro serviço);
armazenamos apenas o `cpf_paciente` como string.
"""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

# Comprimentos máximos centralizados para facilitar manutenção
CPF_LEN = 14  # Ex.: 000.000.000-00
DIA_LEN = 10  # Ex.: YYYY-MM-DD
HORA_LEN = 8  # Ex.: HH:MM ou HH:MM:SS
DESC_LEN = 255
ESTADO_LEN = 40
OBS_LEN = 255

__all__ = ["Base", "Consulta"]


class Base(DeclarativeBase):
    """Base declarativa do SQLAlchemy (2.x)."""
    pass


class Consulta(Base):
    """Consulta médica registrada no serviço de Consultas.

    Campos de data/hora são armazenados como strings (`dia`, `hora`) para
    compatibilidade com o desenho atual do banco.
    """

    __tablename__ = "consultas"

    # Identificador da consulta (PK autoincremental)
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    # Relacionamento lógico via CPF (sem FK entre serviços)
    cpf_paciente: Mapped[str] = mapped_column(String(CPF_LEN), index=True, nullable=False)

    # Dados da consulta
    dia: Mapped[str] = mapped_column(String(DIA_LEN), nullable=False)
    hora: Mapped[str] = mapped_column(String(HORA_LEN), nullable=False)
    descricao: Mapped[str] = mapped_column(String(DESC_LEN), nullable=False)
    estado: Mapped[str | None] = mapped_column(String(ESTADO_LEN), nullable=True)
    observacoes: Mapped[str | None] = mapped_column(String(OBS_LEN), nullable=True)

    # Auditoria simples
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:  # pragma: no cover - utilitário de depuração
        return (
            f"Consulta(id={self.id!r}, cpf={self.cpf_paciente!r}, "
            f"dia={self.dia!r}, hora={self.hora!r})"
        )
