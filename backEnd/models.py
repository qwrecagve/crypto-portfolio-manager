from typing import List, Optional
from datetime import datetime
import numpy as np

class Asset:
    """Kriptovalyuta aktivi modeli"""
    def __init__(self, symbol: str, name: str, amount: float = 0.0, current_price: float = 0.0):
        self.symbol = symbol.upper()
        self.name = name
        self.amount = amount
        self.current_price = current_price
        self.transactions: List['Transaction'] = []

    @property
    def total_value(self) -> float:
        return self.amount * self.current_price

    def __repr__(self):
        return f"<Asset {self.symbol}: {self.amount}>"

class Transaction:
    """Tranzaksiya modeli (Sotib olish yoki Sotish)"""
    def __init__(self, symbol: str, type: str, amount: float, price: float, date: datetime = None):
        self.symbol = symbol.upper()
        self.type = type.lower()  # 'buy' yoki 'sell'
        self.amount = amount
        self.price = price
        self.date = date or datetime.now()

    def __repr__(self):
        return f"<Transaction {self.type} {self.amount} {self.symbol} @ {self.price}>"

class Portfolio:
    """Foydalanuvchi portfeli modeli"""
    def __init__(self, owner: str):
        self.owner = owner
        self.assets: dict[str, Asset] = {}

    def add_asset(self, asset: Asset):
        self.assets[asset.symbol] = asset

    def get_total_value(self) -> float:
        """Portfelning umumiy qiymatini hisoblash (NumPy ishlatilishi mumkin)"""
        if not self.assets:
            return 0.0
        amounts = np.array([asset.amount for asset in self.assets.values()])
        prices = np.array([asset.current_price for asset in self.assets.values()])
        return float(np.dot(amounts, prices))

    def __repr__(self):
        return f"<Portfolio owner={self.owner} assets={list(self.assets.keys())}>"
