# Configuração de acesso ao banco de dados (SQLAlchemy).
#
# Expõe o `engine` (pool/conexão) e a dependência `get_sessao` para o FastAPI,
# abrindo uma sessão por request e garantindo o fechamento ao final.

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

# Lê a URL do banco do ambiente (docker-compose define `DATABASE_URL`).
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg://pacientes:pacientes@db_pacientes:5432/pacientes_db"
)

# Engine = conexão de baixo nível (pool de conexões)
engine = create_engine(DATABASE_URL)

# SessionLocal = fábrica de sessões (transações)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

def get_sessao():
    # Dependency do FastAPI: abre uma sessão por request e fecha ao final.
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
