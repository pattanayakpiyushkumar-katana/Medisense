import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from .config import settings
from .database import init_db
from .routers import symptoms, medicines, medications, health

# Initialize SQLite database schema
init_db()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Medisense — AI-Powered Healthcare Web Application API with strict clinical safety guardrails."
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(symptoms.router)
app.include_router(medicines.router)
app.include_router(medications.router)
app.include_router(health.router)

@app.get("/api/health-check")
def health_check():
    return {
        "status": "healthy",
        "database": "sqlite_ready",
        "mode": settings.AI_PROVIDER,
        "ai_model": settings.AI_MODEL if settings.AI_PROVIDER == "ollama" else None,
        "ollama_base_url": settings.OLLAMA_BASE_URL if settings.AI_PROVIDER == "ollama" else None,
    }

# Check for frontend build directory (unified deployment support on Render)
possible_dist_paths = [
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "static")),
    os.path.abspath("./frontend/dist"),
    os.path.abspath("./dist"),
]

frontend_dist = None
for p in possible_dist_paths:
    if os.path.exists(p) and os.path.exists(os.path.join(p, "index.html")):
        frontend_dist = p
        break

if frontend_dist:
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api/") or full_path == "docs" or full_path == "openapi.json":
            raise HTTPException(status_code=404, detail="API endpoint not found")
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "name": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "status": "operational",
            "mode": f"ai_connected_{settings.AI_PROVIDER}_{settings.AI_MODEL}" if settings.AI_PROVIDER == "ollama" else settings.AI_PROVIDER,
            "ai_provider": settings.AI_PROVIDER,
            "ai_model": settings.AI_MODEL,
            "emergency_contacts": {
                "india": settings.EMERGENCY_NUMBER_INDIA,
                "global": settings.EMERGENCY_NUMBER_GLOBAL
            },
            "docs_url": "/docs"
        }
