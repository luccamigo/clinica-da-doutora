# Modelos SQLAlchemy do serviço de Pacientes.
#
# Define o mapeamento ORM para pacientes e entidades relacionadas. As relações
# usam `selectin` para carregar coleções de forma eficiente, e `cascade`
# garante remoção em cascata dos filhos quando um paciente é excluído.

from __future__ import annotations
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import String, DateTime, ForeignKey
from datetime import datetime

class Base(DeclarativeBase):
    # Base declarativa do SQLAlchemy.
    pass

class Paciente(Base):
    __tablename__ = "pacientes"

    # Identificação e contato
    cpf: Mapped[str] = mapped_column(String(14), primary_key=True)  # PK
    nome_completo: Mapped[str] = mapped_column(String(150), nullable=False)
    data_nascimento: Mapped[str | None] = mapped_column(String(10))
    telefone: Mapped[str | None] = mapped_column(String(20))
    email: Mapped[str | None] = mapped_column(String(120))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    # Relação autorreferenciada: um paciente pode ter um responsável (outro paciente)
    responsavel_cpf: Mapped[str | None] = mapped_column(ForeignKey("pacientes.cpf"), default=None)
    responsavel: Mapped[Paciente | None] = relationship(
        remote_side=[cpf],  # referencia a PK da mesma tabela
        backref="dependentes"
    )

    # Coleções relacionadas (carregadas com selectin por padrão)
    cirurgias: Mapped[list["Cirurgia"]] = relationship(
        back_populates="paciente", cascade="all, delete-orphan", lazy="selectin"
    )
    medicacoes: Mapped[list["Medicacao"]] = relationship(
        back_populates="paciente", cascade="all, delete-orphan", lazy="selectin"
    )
    alergias: Mapped[list["Alergia"]] = relationship(
        back_populates="paciente", cascade="all, delete-orphan", lazy="selectin"
    )


class Cirurgia(Base):
    __tablename__ = "cirurgias"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    paciente_cpf: Mapped[str] = mapped_column(ForeignKey("pacientes.cpf"), index=True, nullable=False)
    nome: Mapped[str] = mapped_column(String(120), nullable=False)
    data: Mapped[str | None] = mapped_column(String(10))  # ou Date
    observacoes: Mapped[str | None] = mapped_column(String(255))

    paciente = relationship("Paciente", back_populates="cirurgias")

class Medicacao(Base):
    __tablename__ = "medicacoes"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    paciente_cpf: Mapped[str] = mapped_column(ForeignKey("pacientes.cpf"), index=True, nullable=False)
    nome: Mapped[str] = mapped_column(String(120), nullable=False)
    dosagem: Mapped[str | None] = mapped_column(String(60))
    frequencia: Mapped[str | None] = mapped_column(String(60))

    paciente = relationship("Paciente", back_populates="medicacoes")

class Alergia(Base):
    __tablename__ = "alergias"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    paciente_cpf: Mapped[str] = mapped_column(ForeignKey("pacientes.cpf"), index=True, nullable=False)
    agente: Mapped[str] = mapped_column(String(120), nullable=False)
    severidade: Mapped[str | None] = mapped_column(String(40))

    paciente = relationship("Paciente", back_populates="alergias")
