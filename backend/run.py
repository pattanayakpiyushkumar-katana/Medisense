import uvicorn
import os

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    is_prod = os.getenv("MEDISENSE_ENV", "development") == "production"
    print(f"Starting Medisense server on http://{host}:{port} ...")
    uvicorn.run("app.main:app", host=host, port=port, reload=not is_prod)
