# Application factory do serviço de Pacientes.
#
# Inicializa a app FastAPI, cria as tabelas (apenas para MVP) e registra as rotas.
# Para produção, recomenda-se usar migrations (Alembic) em vez de `create_all`.

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import pacientes
from .routers import alergias, medicacoes, cirurgias
from .db import engine
from .models import Base

app = FastAPI(title="pacientes-service", version="0.1.0")

# CORS básico para desenvolvimento (CRA no localhost:3000 ou via proxy)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cria as tabelas no primeiro start (MVP). Em produção use Alembic (migrations).
Base.metadata.create_all(bind=engine)

# Registra as rotas do domínio de pacientes
app.include_router(pacientes.router)
app.include_router(alergias.router)
app.include_router(medicacoes.router)
app.include_router(cirurgias.router)

@app.get("/health")
def health():
    # Endpoint de verificação simples de saúde da aplicação.
    return {"status": "ok"}
