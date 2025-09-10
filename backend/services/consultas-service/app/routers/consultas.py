# Rotas HTTP para o domínio de Consultas.
#
# Endpoints:
# - POST   /api/v1/pacientes/{cpf}/consultas  → cria consulta para um paciente
# - GET    /api/v1/pacientes/{cpf}/consultas  → lista consultas por CPF
# - GET    /api/v1/consultas/{id}             → obtém consulta por ID
# - PATCH  /api/v1/consultas/{id}             → atualização parcial
# - DELETE /api/v1/consultas/{id}             → remoção
#
# Nota: este microsserviço é independente do serviço de pacientes. Não há
# validação cross-service do CPF aqui. Em uma evolução, poderíamos chamar o
# serviço de pacientes (via HTTP) para validar existência do CPF informado.

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from ..db import get_sessao
from ..models import Consulta
from ..schemas import ConsultaIn, ConsultaOut, ConsultaAtualizar
from ..validators import assert_cpf_or_422

router = APIRouter(prefix="/api/v1", tags=["consultas"])


def _get_consulta_or_404(db: Session, id: int) -> Consulta:
    c = db.get(Consulta, id)
    if not c:
        raise HTTPException(status_code=404, detail="Consulta não encontrada")
    return c


@router.post("/pacientes/{cpf}/consultas", response_model=ConsultaOut, status_code=201)
def criar_consulta_para_paciente(cpf: str, payload: ConsultaIn, db: Session = Depends(get_sessao)):
    assert_cpf_or_422(cpf)
    # Ignoramos o CPF do payload e usamos o do path param para garantir vínculo.
    data = payload.model_dump(exclude_none=True)
    data["cpf_paciente"] = cpf

    c = Consulta(**data)
    db.add(c)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Violação de integridade ao criar consulta")
    db.refresh(c)
    return c


@router.get("/pacientes/{cpf}/consultas", response_model=list[ConsultaOut])
def listar_consultas_por_paciente(cpf: str, db: Session = Depends(get_sessao)):
    assert_cpf_or_422(cpf)
    # Lista todas as consultas vinculadas ao CPF informado.
    return db.query(Consulta).filter(Consulta.cpf_paciente == cpf).all()


@router.get("/consultas/{id}", response_model=ConsultaOut)
def obter_consulta(id: int, db: Session = Depends(get_sessao)):
    return _get_consulta_or_404(db, id)


@router.patch("/consultas/{id}", response_model=ConsultaOut)
def atualizar_consulta(id: int, payload: ConsultaAtualizar, db: Session = Depends(get_sessao)):
    c = _get_consulta_or_404(db, id)
    data = payload.model_dump(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=400, detail="Nenhum campo para atualizar")

    for k, v in data.items():
        setattr(c, k, v)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Violação de integridade ao atualizar consulta")
    db.refresh(c)
    return c


@router.delete("/consultas/{id}", status_code=204)
def remover_consulta(id: int, db: Session = Depends(get_sessao)):
    c = _get_consulta_or_404(db, id)
    db.delete(c)
    db.commit()
    return


@router.get("/consultas", response_model=list[ConsultaOut])
def listar_consultas(dia: str | None = None, db: Session = Depends(get_sessao)):
    """Lista consultas.

    - Se `dia` for informado (YYYY-MM-DD), filtra por esse dia.
    - Caso contrário, retorna todas as consultas (sem paginação – uso controlado).
    """
    q = db.query(Consulta)
    if dia:
        q = q.filter(Consulta.dia == dia)
    return q.all()
