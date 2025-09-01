from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

# Pegamos a URL do banco de dados do docker-compose (variável de ambiente)
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg://pacientes:pacientes@db_pacientes:5432/pacientes_db"
)

# Engine = conexão de baixo nível (pool)
engine = create_engine(DATABASE_URL)

# SessionLocal = fábrica de sessões (transações)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

def get_sessao():
    """Dependency do FastAPI: abre uma sessão por request e fecha ao final."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()