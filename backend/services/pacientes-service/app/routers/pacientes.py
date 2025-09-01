from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from ..db import get_sessao
from ..models import Paciente
from ..schemas import PacienteIn, PacienteOut, PacienteAtualizar, PacienteOutLeve, MedicacaoIn, CirurgiaIn, AlergiaIn  

router = APIRouter(prefix="/api/v1/pacientes", tags=["pacientes"])


# função auxiliar para evitar repetição
def _get_paciente_or_404(db: Session, cpf: str) -> Paciente:
    p = db.get(Paciente, cpf)
    if not p:
        raise HTTPException(status_code=404, detail="Paciente não encontrado")
    return p


# cria paciente e verifica cpf duplicado
@router.post("", response_model=PacienteOut, status_code=201)
def criar_paciente(payload: PacienteIn, db: Session = Depends(get_sessao)):
    # se veio responsavel_cpf, checa se existe (opcional no MVP)
    if payload.responsavel_cpf:
        if not db.get(Paciente, payload.responsavel_cpf):
            raise HTTPException(status_code=422, detail="CPF do responsável não consta na nossa base de dados")

    # como não existe esses campos em paciente, vamos extrair. caso nao haja, lista vazia
    cirs = payload.cirurgias or []
    meds = payload.medicacoes or []
    ales = payload.alergias or []

    paciente = Paciente(**payload.model_dump())
    for c in cirs:
        paciente.cirurgias.append(CirurgiaIn(**c.model_dump(), paciente_cpf=paciente.cpf))
    for m in meds:
        paciente.medicacoes.append(MedicacaoIn(**m.model_dump(), paciente_cpf=paciente.cpf))
    for a in ales:
        paciente.alergias.append(AlergiaIn(**a.model_dump(), paciente_cpf=paciente.cpf))

    db.add(paciente)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="CPF já cadastrado")
    db.refresh(paciente)
    return paciente


# atualiza paciente (PUT parcial)
@router.patch("/{cpf}", response_model=PacienteOut)
def atualizar_paciente_parcial(
    cpf: str,
    payload: PacienteAtualizar,
    db: Session = Depends(get_sessao)
):
    if not data:
        raise HTTPException(status_code=400, detail="Nenhum campo para atualizar")

    p = _get_paciente_or_404(db, cpf)

    data = payload.model_dump(exclude_unset=True)

    # validações
    if "responsavel_cpf" in data and data["responsavel_cpf"]:
        if data["responsavel_cpf"] == cpf:
            raise HTTPException(status_code=422, detail="responsavel_cpf não pode ser o próprio CPF")
        if not db.get(Paciente, data["responsavel_cpf"]):
            raise HTTPException(status_code=422, detail="CPF do responsável não consta na nossa base de dados")

    # aplica alterações campo a campo
    for k, v in data.items():
        setattr(p, k, v)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        # hoje só afetaria e-mail/telefone se você criar constraints; por segurança:
        raise HTTPException(status_code=409, detail="Violação de unicidade em algum campo")
    db.refresh(p)
    return p


# get paciente
@router.get("/{cpf}", response_model=PacienteOutLeve)
def obter_paciente(cpf: str, db: Session = Depends(get_sessao)):
    p = _get_paciente_or_404(db, cpf)
    return p


# delete paciente
@router.delete("/{cpf}", status_code=204)
def excluir_paciente(cpf: str, db: Session = Depends(get_sessao)):
    p = _get_paciente_or_404(db, cpf)
    db.delete(p)
    db.commit()
    return

