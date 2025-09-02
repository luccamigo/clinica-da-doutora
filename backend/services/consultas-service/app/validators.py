"""Validações utilitárias do serviço de Consultas.

Inclui validação de CPF no formato XXX.XXX.XXX-XX.
"""

from __future__ import annotations

import re
from fastapi import HTTPException

CPF_REGEX = re.compile(r"^\d{3}\.\d{3}\.\d{3}-\d{2}$")


def validar_cpf_formato(valor: str) -> str:
    """Valida o formato do CPF e retorna o valor se válido.

    Aceita apenas o padrão XXX.XXX.XXX-XX. Lança ValueError caso inválido.
    """
    if not isinstance(valor, str):
        raise ValueError("CPF deve ser uma string")
    if not CPF_REGEX.fullmatch(valor):
        raise ValueError("CPF deve seguir o padrão XXX.XXX.XXX-XX")
    return valor


def assert_cpf_or_422(cpf: str) -> None:
    """Lança HTTP 422 se o CPF não estiver no formato esperado."""
    if not CPF_REGEX.fullmatch(cpf or ""):
        raise HTTPException(status_code=422, detail="CPF deve seguir o padrão XXX.XXX.XXX-XX")

