from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import db_models
import schemas
from database import get_db, engine, Base

# Jadvallarni yaratish (SQLite uchun darhol ishlaydi, Azure SQL uchun ham)
try:
    Base.metadata.create_all(bind=engine)
    print("[OK] Jadvallar yaratildi yoki allaqachon mavjud.")
except Exception as e:
    print(f"[WARNING] Jadval yaratishda xato: {e}")

app = FastAPI(title="Crypto Portfolio Manager API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "Crypto Portfolio Manager API ishlayapti",
        "version": "1.0.0"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# --- ASSETS ---
@app.get("/assets/", response_model=List[schemas.AssetResponse])
def get_assets(db: Session = Depends(get_db)):
    try:
        assets = db.query(db_models.DBAsset).all()
        return [
            {
                "symbol": a.symbol,
                "name": a.name,
                "amount": a.amount,
                "current_price": a.current_price,
                "total_value": round(a.amount * a.current_price, 2)
            }
            for a in assets
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- TRANSACTIONS ---
@app.post("/transactions/", response_model=schemas.Transaction)
def create_transaction(transaction: schemas.TransactionCreate, db: Session = Depends(get_db)):
    try:
        # Aktivni topish yoki yaratish
        db_asset = db.query(db_models.DBAsset).filter(
            db_models.DBAsset.symbol == transaction.symbol.upper()
        ).first()
        
        if not db_asset:
            db_asset = db_models.DBAsset(
                symbol=transaction.symbol.upper(),
                name=transaction.symbol.upper(),
                amount=0.0,
                current_price=transaction.price
            )
            db.add(db_asset)
            db.flush()

        # Narxni yangilash
        db_asset.current_price = transaction.price

        # Miqdorni yangilash
        if transaction.type == "buy":
            db_asset.amount += transaction.amount
        elif transaction.type == "sell":
            if db_asset.amount < transaction.amount:
                raise HTTPException(status_code=400, detail="Mablag' yetarli emas")
            db_asset.amount -= transaction.amount

        # Tranzaksiyani saqlash
        new_tx = db_models.DBTransaction(
            asset_id=db_asset.id,
            type=transaction.type,
            amount=transaction.amount,
            price=transaction.price
        )
        db.add(new_tx)
        db.commit()
        db.refresh(new_tx)
        return new_tx

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# --- PORTFOLIO SUMMARY ---
@app.get("/portfolio/summary", response_model=schemas.PortfolioSummary)
def get_portfolio_summary(db: Session = Depends(get_db)):
    try:
        assets = db.query(db_models.DBAsset).filter(db_models.DBAsset.amount > 0).all()

        if not assets:
            return {"total_value": 0.0, "assets_count": 0, "assets": []}

        asset_list = [
            {
                "symbol": a.symbol,
                "name": a.name,
                "amount": a.amount,
                "current_price": a.current_price,
                "total_value": round(a.amount * a.current_price, 2)
            }
            for a in assets
        ]
        total = sum(a["total_value"] for a in asset_list)

        return {
            "total_value": round(total, 2),
            "assets_count": len(asset_list),
            "assets": asset_list
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- TRANSACTIONS LIST ---
@app.get("/transactions/")
def get_transactions(db: Session = Depends(get_db)):
    try:
        txs = db.query(db_models.DBTransaction).order_by(
            db_models.DBTransaction.timestamp.desc()
        ).limit(50).all()
        return txs
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
