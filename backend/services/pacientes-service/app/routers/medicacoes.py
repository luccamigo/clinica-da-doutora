# Rotas para CRUD de Medicações.
#
# Endpoints:
# - POST   /api/v1/pacientes/{cpf}/medicacoes   → cria medicação para um paciente
# - GET    /api/v1/pacientes/{cpf}/medicacoes   → lista medicações do paciente
# - GET    /api/v1/medicacoes/{id}              → obtém medicação por id
# - PATCH  /api/v1/medicacoes/{id}              → atualiza parcialmente
# - DELETE /api/v1/medicacoes/{id}              → remove medicação

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from ..db import get_sessao
from ..models import Paciente, Medicacao
from ..schemas import MedicacaoIn, MedicacaoOut, MedicacaoAtualizar
from ..validators import assert_cpf_or_422

router = APIRouter(prefix="/api/v1", tags=["medicacoes"])


def _get_paciente_or_404(db: Session, cpf: str) -> Paciente:
    assert_cpf_or_422(cpf)
    p = db.get(Paciente, cpf)
    if not p:
        raise HTTPException(status_code=404, detail="Paciente não encontrado")
    return p


@router.post("/pacientes/{cpf}/medicacoes", response_model=MedicacaoOut, status_code=201)
def criar_medicacao_para_paciente(cpf: str, payload: MedicacaoIn, db: Session = Depends(get_sessao)):
    _get_paciente_or_404(db, cpf)
    data = payload.model_dump(exclude_none=True)
    data["paciente_cpf"] = cpf

    med = Medicacao(**data)
    db.add(med)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Violação de integridade ao criar medicação")
    db.refresh(med)
    return med


@router.get("/pacientes/{cpf}/medicacoes", response_model=list[MedicacaoOut])
def listar_medicacoes_do_paciente(cpf: str, db: Session = Depends(get_sessao)):
    _get_paciente_or_404(db, cpf)
    return db.query(Medicacao).filter(Medicacao.paciente_cpf == cpf).all()


def _get_medicacao_or_404(db: Session, id: int) -> Medicacao:
    m = db.get(Medicacao, id)
    if not m:
        raise HTTPException(status_code=404, detail="Medicação não encontrada")
    return m


@router.get("/medicacoes/{id}", response_model=MedicacaoOut)
def obter_medicacao(id: int, db: Session = Depends(get_sessao)):
    return _get_medicacao_or_404(db, id)


@router.patch("/medicacoes/{id}", response_model=MedicacaoOut)
def atualizar_medicacao(id: int, payload: MedicacaoAtualizar, db: Session = Depends(get_sessao)):
    m = _get_medicacao_or_404(db, id)
    data = payload.model_dump(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=400, detail="Nenhum campo para atualizar")

    for k, v in data.items():
        setattr(m, k, v)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Violação de integridade ao atualizar medicação")
    db.refresh(m)
    return m


@router.delete("/medicacoes/{id}", status_code=204)
def remover_medicacao(id: int, db: Session = Depends(get_sessao)):
    m = _get_medicacao_or_404(db, id)
    db.delete(m)
    db.commit()
    return
