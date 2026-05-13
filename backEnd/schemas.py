from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class TransactionBase(BaseModel):
    symbol: str
    type: str = Field(..., pattern="^(buy|sell)$")
    amount: float = Field(..., gt=0)
    price: float = Field(..., gt=0)
    date: Optional[datetime] = None

class TransactionCreate(TransactionBase):
    pass

class Transaction(TransactionBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True

class AssetBase(BaseModel):
    symbol: str
    name: str
    amount: float = 0.0
    current_price: float = 0.0

class AssetResponse(AssetBase):
    total_value: float

class PortfolioSummary(BaseModel):
    total_value: float
    assets_count: int
    assets: List[AssetResponse]
