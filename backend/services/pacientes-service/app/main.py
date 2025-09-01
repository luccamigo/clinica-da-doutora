from fastapi import FastAPI
from .routers import pacientes
from .db import engine
from .models import Base

app = FastAPI(title="pacientes-service", version="0.1.0")

# Cria as tabelas no primeiro start (MVP). Em produção use migrations (Alembic).
Base.metadata.create_all(bind=engine)

# Registra as rotas
app.include_router(pacientes.router)

@app.get("/health")
def health():
    return {"status": "ok"}