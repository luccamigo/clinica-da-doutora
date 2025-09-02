# Rotas para CRUD de Cirurgias.
#
# Endpoints:
# - POST   /api/v1/pacientes/{cpf}/cirurgias   → cria cirurgia para um paciente
# - GET    /api/v1/pacientes/{cpf}/cirurgias   → lista cirurgias do paciente
# - GET    /api/v1/cirurgias/{id}              → obtém cirurgia por id
# - PATCH  /api/v1/cirurgias/{id}              → atualiza parcialmente
# - DELETE /api/v1/cirurgias/{id}              → remove cirurgia

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from ..db import get_sessao
from ..models import Paciente, Cirurgia
from ..schemas import CirurgiaIn, CirurgiaOut, CirurgiaAtualizar
from ..validators import assert_cpf_or_422

router = APIRouter(prefix="/api/v1", tags=["cirurgias"])


def _get_paciente_or_404(db: Session, cpf: str) -> Paciente:
    assert_cpf_or_422(cpf)
    p = db.get(Paciente, cpf)
    if not p:
        raise HTTPException(status_code=404, detail="Paciente não encontrado")
    return p


@router.post("/pacientes/{cpf}/cirurgias", response_model=CirurgiaOut, status_code=201)
def criar_cirurgia_para_paciente(cpf: str, payload: CirurgiaIn, db: Session = Depends(get_sessao)):
    _get_paciente_or_404(db, cpf)
    data = payload.model_dump(exclude_none=True)
    data["paciente_cpf"] = cpf

    c = Cirurgia(**data)
    db.add(c)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Violação de integridade ao criar cirurgia")
    db.refresh(c)
    return c


@router.get("/pacientes/{cpf}/cirurgias", response_model=list[CirurgiaOut])
def listar_cirurgias_do_paciente(cpf: str, db: Session = Depends(get_sessao)):
    _get_paciente_or_404(db, cpf)
    return db.query(Cirurgia).filter(Cirurgia.paciente_cpf == cpf).all()


def _get_cirurgia_or_404(db: Session, id: int) -> Cirurgia:
    c = db.get(Cirurgia, id)
    if not c:
        raise HTTPException(status_code=404, detail="Cirurgia não encontrada")
    return c


@router.get("/cirurgias/{id}", response_model=CirurgiaOut)
def obter_cirurgia(id: int, db: Session = Depends(get_sessao)):
    return _get_cirurgia_or_404(db, id)


@router.patch("/cirurgias/{id}", response_model=CirurgiaOut)
def atualizar_cirurgia(id: int, payload: CirurgiaAtualizar, db: Session = Depends(get_sessao)):
    c = _get_cirurgia_or_404(db, id)
    data = payload.model_dump(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=400, detail="Nenhum campo para atualizar")

    for k, v in data.items():
        setattr(c, k, v)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Violação de integridade ao atualizar cirurgia")
    db.refresh(c)
    return c


@router.delete("/cirurgias/{id}", status_code=204)
def remover_cirurgia(id: int, db: Session = Depends(get_sessao)):
    c = _get_cirurgia_or_404(db, id)
    db.delete(c)
    db.commit()
    return
