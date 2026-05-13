from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# .env fayldan o'qish (lokal uchun)
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./crypto_portfolio.db")

# Engine yaratish
try:
    if "database.windows.net" in DATABASE_URL:
        # Azure SQL (pyodbc yoki pymssql)
        engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,
            pool_recycle=300,
            connect_args={"timeout": 30}
        )
    else:
        # SQLite (lokal yoki fallback)
        engine = create_engine(
            DATABASE_URL,
            connect_args={"check_same_thread": False}
        )
except Exception as e:
    # Agar baza ulanmasa, SQLite ga qayt
    print(f"[WARNING] DB ulanmadi: {e}. SQLite ishlatilmoqda.")
    engine = create_engine(
        "sqlite:///./crypto_portfolio.db",
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
