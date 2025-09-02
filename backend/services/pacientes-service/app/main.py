# Application factory do serviço de Pacientes.
#
# Inicializa a app FastAPI, cria as tabelas (apenas para MVP) e registra as rotas.
# Para produção, recomenda-se usar migrations (Alembic) em vez de `create_all`.

from fastapi import FastAPI
from .routers import pacientes
from .routers import alergias, medicacoes, cirurgias
from .db import engine
from .models import Base

app = FastAPI(title="pacientes-service", version="0.1.0")

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
