# Application factory do serviço de Consultas.
#
# Responsável por inicializar a aplicação FastAPI, criar as tabelas (MVP) e
# registrar as rotas relacionadas às consultas médicas.

from fastapi import FastAPI
from .db import engine
from .models import Base
from .routers import consultas


# Instancia a aplicação FastAPI com metadados básicos
app = FastAPI(title="consultas-service", version="0.1.0")


# Cria as tabelas no banco no primeiro start (MVP). Para produção, prefira
# migrations com Alembic em vez de `create_all`.
Base.metadata.create_all(bind=engine)


# Registra as rotas do domínio de consultas
app.include_router(consultas.router)


@app.get("/health")
def health():
    """Endpoint de verificação simples de saúde da aplicação."""
    return {"status": "ok"}

