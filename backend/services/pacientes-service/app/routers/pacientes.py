# Rotas HTTP para o domínio de Pacientes.
#
# Este módulo expõe endpoints REST para criar, atualizar, consultar e excluir
# pacientes, bem como retornar detalhes com relacionamentos (cirurgias,
# medicações e alergias). Foi escrito em FastAPI com dependência de sessão do
# SQLAlchemy injetada por request.

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import select

from ..db import get_sessao
from ..models import Paciente, Cirurgia, Medicacao, Alergia
from ..schemas import (
    PacienteIn,
    PacienteOut,
    PacienteAtualizar,
    PacienteOutLeve,
    MedicacaoIn,
    CirurgiaIn,
    AlergiaIn,
)
from ..validators import assert_cpf_or_422

router = APIRouter(
    prefix="/api/v1/pacientes",
    tags=["pacientes"],  # agrupamento no Swagger/Redoc
)


def _get_paciente_or_404(db: Session, cpf: str) -> Paciente:
    # Busca um paciente pela PK (CPF) ou lança 404.
    # Centralizamos essa verificação para reutilizar em múltiplos endpoints
    # e manter uma mensagem consistente.
    assert_cpf_or_422(cpf)
    p = db.get(Paciente, cpf)
    if not p:
        raise HTTPException(status_code=404, detail="Paciente não encontrado")
    return p


# Cria um novo paciente com dados básicos e relacionamentos opcionais.
# Regras de negócio:
# - Se informado, `responsavel_cpf` não pode ser igual ao CPF do próprio paciente
#   e deve apontar para um paciente já existente.
# - As coleções aninhadas (cirurgia, medicacao, alergia) são opcionais.
@router.post("", response_model=PacienteOut, status_code=201)
def criar_paciente(payload: PacienteIn, db: Session = Depends(get_sessao)):
    # se veio responsavel_cpf, checa se existe (opcional no MVP)
    if payload.responsavel_cpf:
        if payload.responsavel_cpf == payload.cpf:
            raise HTTPException(status_code=422, detail="responsavel_cpf não pode ser o próprio CPF")
        if not db.get(Paciente, payload.responsavel_cpf):
            raise HTTPException(status_code=422, detail="CPF do responsável não consta na nossa base de dados")

    data = payload.model_dump(
        exclude={"cirurgia", "medicacao", "alergia"},
        exclude_none=True,
    )

    # Campos aninhados não pertencem diretamente à tabela pacientes: extraímos.
    # Caso não haja, usamos listas vazias.
    cirs = payload.cirurgia or []
    meds = payload.medicacao or []
    ales = payload.alergia or []

    paciente = Paciente(**data)

    # Relacionamentos: criamos instâncias SQLAlchemy e anexamos às coleções.
    # O SQLAlchemy preencherá `paciente_cpf` via relacionamento (FK) ao persistir.
    for c in cirs:
        paciente.cirurgias.append(Cirurgia(**c.model_dump(exclude_none=True)))
    for m in meds:
        paciente.medicacoes.append(Medicacao(**m.model_dump(exclude_none=True)))
    for a in ales:
        a_data = a.model_dump(exclude_none=True)
        # Ignoramos paciente_cpf do payload aninhado: o relacionamento define isso.
        a_data.pop("paciente_cpf", None)
        paciente.alergias.append(Alergia(**a_data))

    db.add(paciente)
    try:
        db.commit()  # pode lançar IntegrityError, ex.: PK (CPF) duplicada
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="CPF já cadastrado")
    db.refresh(paciente)
    return paciente


# atualiza paciente (PUT parcial)
# Atualização parcial (PATCH) de campos do paciente.
# Usa `exclude_unset=True` para aplicar somente os campos enviados.
# Valida `responsavel_cpf` para evitar autorreferência e garantir existência.
@router.patch("/{cpf}", response_model=PacienteOut)
def atualizar_paciente_parcial(
    cpf: str,
    payload: PacienteAtualizar,
    db: Session = Depends(get_sessao)
):
    p = _get_paciente_or_404(db, cpf)

    data = payload.model_dump(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=400, detail="Nenhum campo para atualizar")

    # validações
    if "responsavel_cpf" in data and data["responsavel_cpf"]:
        if data["responsavel_cpf"] == cpf:
            raise HTTPException(status_code=422, detail="responsavel_cpf não pode ser o próprio CPF")
        if not db.get(Paciente, data["responsavel_cpf"]):
            raise HTTPException(status_code=422, detail="CPF do responsável não consta na nossa base de dados")

    # Aplica alterações campo a campo de forma segura
    for k, v in data.items():
        setattr(p, k, v)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        # Hoje só afetaria e-mail/telefone se houver constraints; por segurança:
        raise HTTPException(status_code=409, detail="Violação de unicidade em algum campo")
    db.refresh(p)
    return p


# get paciente
# Retorna dados básicos do paciente (sem coleções).
@router.get("/{cpf}", response_model=PacienteOutLeve)
def obter_paciente(cpf: str, db: Session = Depends(get_sessao)):
    p = _get_paciente_or_404(db, cpf)
    return p

# Retorna o paciente com relacionamentos (cirurgias, medicações, alergias).
@router.get("/{cpf}/details", response_model=PacienteOut)
def obter_paciente_detalhado(cpf: str, db: Session = Depends(get_sessao)):
    p = _get_paciente_or_404(db, cpf)
    return p


# delete paciente
# Remove definitivamente o paciente e seus relacionamentos (cascade).
@router.delete("/{cpf}", status_code=204)
def excluir_paciente(cpf: str, db: Session = Depends(get_sessao)):
    p = _get_paciente_or_404(db, cpf)
    db.delete(p)
    db.commit()
    return
@router.get("", response_model=list[PacienteOutLeve])
def listar_pacientes(
    q: str | None = Query(default=None, description="Busca por nome (ilike) ou CPF"),
    limit: int | None = Query(default=None, ge=1, le=10000),
    db: Session = Depends(get_sessao),
):
    # Lista pacientes. Se `q` for informado:
    # - Numérico com 11+ dígitos → filtro por prefixo de CPF
    # - Caso contrário → filtro por nome (ilike)
    stmt = select(Paciente)
    if q:
        # Busca por nome (ilike) OU por CPF como string (com pontuação)
        stmt = stmt.where(
            (Paciente.nome_completo.ilike(f"%{q}%")) | (Paciente.cpf.ilike(f"%{q}%"))
        )
    if limit:
        stmt = stmt.limit(limit)
    return db.execute(stmt).scalars().all()

@router.get("/todos", response_model=list[PacienteOutLeve])
def listar_todos(db: Session = Depends(get_sessao)):
    # Rota explícita para retornar todos os pacientes (sem paginação)
    stmt = select(Paciente)
    return db.execute(stmt).scalars().all()
