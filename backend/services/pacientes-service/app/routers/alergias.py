# Rotas para CRUD de Alergias.
#
# Endpoints:
# - POST   /api/v1/pacientes/{cpf}/alergias   → cria alergia para um paciente
# - GET    /api/v1/pacientes/{cpf}/alergias   → lista alergias do paciente
# - GET    /api/v1/alergias/{id}              → obtém alergia por id
# - PATCH  /api/v1/alergias/{id}              → atualiza parcialmente
# - DELETE /api/v1/alergias/{id}              → remove alergia

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from ..db import get_sessao
from ..models import Paciente, Alergia
from ..schemas import AlergiaIn, AlergiaOut, AlergiaAtualizar
from ..validators import assert_cpf_or_422

router = APIRouter(prefix="/api/v1", tags=["alergias"])


def _get_paciente_or_404(db: Session, cpf: str) -> Paciente:
    # Busca paciente pela PK (CPF) ou lança 404
    assert_cpf_or_422(cpf)
    p = db.get(Paciente, cpf)
    if not p:
        raise HTTPException(status_code=404, detail="Paciente não encontrado")
    return p


@router.post("/pacientes/{cpf}/alergias", response_model=AlergiaOut, status_code=201)
def criar_alergia_para_paciente(cpf: str, payload: AlergiaIn, db: Session = Depends(get_sessao)):
    # Cria uma alergia vinculada ao paciente informado no path
    _get_paciente_or_404(db, cpf)

    data = payload.model_dump(exclude_none=True)
    # Garante vínculo pelo path param
    data["paciente_cpf"] = cpf

    alergia = Alergia(**data)
    db.add(alergia)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Violação de integridade ao criar alergia")
    db.refresh(alergia)
    return alergia


@router.get("/pacientes/{cpf}/alergias", response_model=list[AlergiaOut])
def listar_alergias_do_paciente(cpf: str, db: Session = Depends(get_sessao)):
    # Lista as alergias de um paciente
    _get_paciente_or_404(db, cpf)
    # Consulta simples por FK
    return db.query(Alergia).filter(Alergia.paciente_cpf == cpf).all()


def _get_alergia_or_404(db: Session, id: int) -> Alergia:
    # Busca a alergia por ID ou lança 404
    a = db.get(Alergia, id)
    if not a:
        raise HTTPException(status_code=404, detail="Alergia não encontrada")
    return a


@router.get("/alergias/{id}", response_model=AlergiaOut)
def obter_alergia(id: int, db: Session = Depends(get_sessao)):
    return _get_alergia_or_404(db, id)


@router.patch("/alergias/{id}", response_model=AlergiaOut)
def atualizar_alergia(id: int, payload: AlergiaAtualizar, db: Session = Depends(get_sessao)):
    # Atualização parcial da alergia
    a = _get_alergia_or_404(db, id)
    data = payload.model_dump(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=400, detail="Nenhum campo para atualizar")

    for k, v in data.items():
        setattr(a, k, v)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Violação de integridade ao atualizar alergia")
    db.refresh(a)
    return a


@router.delete("/alergias/{id}", status_code=204)
def remover_alergia(id: int, db: Session = Depends(get_sessao)):
    a = _get_alergia_or_404(db, id)
    db.delete(a)
    db.commit()
    return
