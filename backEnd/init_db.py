from database import engine, Base
import db_models

def init_db():
    print("Ma'lumotlar bazasi jadvallari yaratilmoqda...")
    try:
        Base.metadata.create_all(bind=engine)
        print("Jadvallar muvaffaqiyatli yaratildi!")
    except Exception as e:
        print(f"Xatolik yuz berdi: {e}")

if __name__ == "__main__":
    init_db()
