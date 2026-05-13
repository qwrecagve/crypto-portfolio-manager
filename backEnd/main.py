from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import db_models, schemas, database, analytics
from database import get_db, engine
from fastapi.middleware.cors import CORSMiddleware

# Jadvallarni tekshirish (agar yaratilmagan bo'lsa)
db_models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Crypto Portfolio Manager API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "online", "xabar": "Kriptovalyuta Portfeli Menejeri API tizimi ishlamoqda"}

# --- ASSETS ---
@app.get("/assets/", response_model=List[schemas.AssetResponse])
def get_assets(db: Session = Depends(get_db)):
    assets = db.query(db_models.DBAsset).all()
    results = []
    for asset in assets:
        results.append({
            "symbol": asset.symbol,
            "name": asset.name,
            "amount": asset.amount,
            "current_price": asset.current_price,
            "total_value": asset.amount * asset.current_price
        })
    return results

# --- TRANSACTIONS ---
@app.post("/transactions/", response_model=schemas.Transaction)
def create_transaction(transaction: schemas.TransactionCreate, db: Session = Depends(get_db)):
    # Aktivni topish yoki yaratish
    db_asset = db.query(db_models.DBAsset).filter(db_models.DBAsset.symbol == transaction.symbol.upper()).first()
    if not db_asset:
        db_asset = db_models.DBAsset(symbol=transaction.symbol.upper(), name=transaction.symbol.upper(), amount=0.0)
        db.add(db_asset)
        db.commit()
        db.refresh(db_asset)

    # Miqdorni yangilash
    if transaction.type == "buy":
        db_asset.amount += transaction.amount
    elif transaction.type == "sell":
        if db_asset.amount < transaction.amount:
            raise HTTPException(status_code=400, detail="Mablag' yetarli emas")
        db_asset.amount -= transaction.amount
    
    # Tranzaksiyani saqlash
    new_transaction = db_models.DBTransaction(
        asset_id=db_asset.id,
        type=transaction.type,
        amount=transaction.amount,
        price=transaction.price
    )
    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)
    return new_transaction

# --- ANALYTICS ---
@app.get("/portfolio/summary", response_model=schemas.PortfolioSummary)
def get_portfolio_summary(db: Session = Depends(get_db)):
    assets = db.query(db_models.DBAsset).all()
    
    if not assets:
        return {"total_value": 0, "assets_count": 0, "assets": []}

    amounts = [a.amount for a in assets]
    prices = [a.current_price for a in assets]
    symbols = [a.symbol for a in assets]

    # NumPy analytics ishlatish
    stats = analytics.PortfolioAnalytics.calculate_pnl(amounts, prices, prices) # Soddalashtirilgan
    allocations = analytics.PortfolioAnalytics.get_allocation(amounts, prices, symbols)

    asset_list = []
    for a in assets:
        asset_list.append({
            "symbol": a.symbol,
            "name": a.name,
            "amount": a.amount,
            "current_price": a.current_price,
            "total_value": a.amount * a.current_price
        })

    return {
        "total_value": stats["current_value"],
        "assets_count": len(assets),
        "assets": asset_list
    }
