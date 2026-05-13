import uvicorn
import os
from dotenv import load_dotenv

load_dotenv()

if __name__ == "__main__":
    # Backendni 8000-portda ishga tushiramiz
    print("Kriptovalyuta Portfeli Menejeri Backend tizimi ishga tushmoqda...")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
