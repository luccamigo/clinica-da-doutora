# Configuração de acesso ao banco de dados (SQLAlchemy) do serviço de Consultas.
#
# Este módulo expõe:
# - `engine`: conexão de baixo nível (pool) com o banco de dados
# - `SessionLocal`: fábrica de sessões (transações)
# - `get_sessao`: dependência do FastAPI para abrir/fechar sessão por request

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

# URL do banco de dados. Em desenvolvimento via docker-compose, apontamos para o
# serviço `db_consultas`. Em produção, configure via variável de ambiente.
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg://consultas:consultas@db_consultas:5432/consultas_db",
)

# Cria o engine (gerencia pool de conexões com o Postgres)
engine = create_engine(DATABASE_URL)

# Cria uma fábrica de sessões. `autoflush=False` e `autocommit=False` são o padrão seguro.
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_sessao():
    """Dependência usada nos endpoints para obter uma sessão por request.

    Garante o fechamento da sessão ao final do ciclo do request, evitando
    vazamentos de conexão.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

