from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class DBAsset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(10), unique=True, index=True)
    name = Column(String(50))
    amount = Column(Float, default=0.0)
    current_price = Column(Float, default=0.0)

    transactions = relationship("DBTransaction", back_populates="asset")

class DBTransaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"))
    type = Column(String(10))  # 'buy' yoki 'sell'
    amount = Column(Float)
    price = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)

    asset = relationship("DBAsset", back_populates="transactions")
