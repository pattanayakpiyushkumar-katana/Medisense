# Medisense — AI-Powered Healthcare Web Application

> **"Understand Your Health. Make Informed Decisions."**

Medisense is a patient-centered health companion web application designed to help ordinary people understand their symptoms, determine appropriate levels of medical care, explore medicines in simple language, maintain daily medication schedules with reminders, and walk into doctor appointments prepared.

Medisense is powered by **Google Gemma 3:4B** (`gemma3:4b`), an institution-approved open-weight medical decision support engine running locally and privately via **Ollama**.

---

## 🏥 Clinical Safety & AI Guardrails Notice

> [!IMPORTANT]
> **Educational & Supportive Tool Only:** Medisense is designed for health literacy, triage safety, and doctor consultation preparation. It is **NOT** a replacement for a qualified medical doctor and does **NOT** provide definitive medical diagnoses or prescribe new pharmaceutical treatments. Switching to Gemma 3:4B does not make this application a certified medical diagnostic device.

### Key Clinical Safety Rules:
1. **Emergency-First Triage:** Hardcoded conservative clinical rules identify acute emergencies (crushing chest pain, stroke symptoms, respiratory distress, anaphylaxis, infant high fever) and trigger immediate emergency advice (**112 in India, 911 in USA**) before and above any generative AI processing. Emergency signs bypass the language model entirely and cannot be downgraded.
2. **Deterministic Clinical Safety Floor:** Even when Gemma 3:4B is active, an independent safety rule layer evaluates the urgency floor. The model is strictly prevented from downgrading an urgent recommendation (such as "See a Doctor Soon") to "Home Care".
3. **No Fabricated Dosages or Diagnoses:** Drug information is retrieved exclusively from verified pharmaceutical compendiums (WHO Model List of Essential Medicines, CDSCO India, FDA). The model is never permitted to guess or fabricate drug monographs or dosages. Unknown patient health history is explicitly labeled as *"Not provided"*, never guessed.
4. **Ambiguity Defense:** Vague search queries (e.g. *"painkiller"*, *"cough syrup"*, *"antibiotic"*) trigger proactive clarification prompts asking for the active ingredient or package label before providing guidance.
5. **Private Backend-Only Inference:** The frontend never connects to Ollama directly and never exposes server credentials or private ports. All inference is mediated, validated, and sanitized by the backend.

---

## 🤖 Target AI Model: Google Gemma 3 (4B) via Ollama

Medisense uses Google's Gemma 3 open-weight model with 4 billion parameters running on a local or private Ollama inference server:
- **Model:** Google Gemma 3
- **Model Size:** 4B parameters
- **Exact Ollama Tag:** `gemma3:4b`
- **Inference Server:** Ollama
- **Default Base URL:** `http://localhost:11434`
- **Chat Endpoint:** `/api/chat`
- **Structured JSON Mode:** Enforced with Pydantic v2 validation and robust parser recovery.

---

## 🚀 Technology Stack

- **AI Engine:** Google Gemma 3:4B (`gemma3:4b`) via Ollama local inference
- **Frontend:** React 19, TypeScript, Vite 8, React Router v7
- **Styling:** Tailwind CSS (Accessible contrast, mobile-first responsive design, print-friendly `@media print` support)
- **UI Icons:** Lucide React
- **Backend:** Python 3.13, FastAPI, Uvicorn
- **Data Validation:** Pydantic v2
- **Database:** SQLite (local zero-configuration storage) with SQLAlchemy ORM
- **Testing:** Pytest & FastAPI TestClient (29 automated unit and integration tests with mocked Ollama responses) + Vite Production Build Bundler

---

## 📁 Project Structure

```text
medisense/
├── backend/
│   ├── app/
│   │   ├── config.py                   # Environment settings & Gemma/Ollama configuration
│   │   ├── database.py                 # SQLite database engine & schema initialization
│   │   ├── main.py                     # FastAPI application setup, CORS, router mounts
│   │   ├── data/
│   │   │   ├── verified_medicines.json # Curated clinical drug database (WHO, CDSCO, FDA)
│   │   │   └── health_conditions.json  # Evidence-based chronic disease guides
│   │   ├── models/
│   │   │   ├── medication.py           # Medication and DoseLog SQLAlchemy tables
│   │   │   └── assessment.py           # SymptomAssessment and DoctorSummary tables
│   │   ├── schemas/
│   │   │   ├── symptom.py              # Symptom analysis request/response schemas
│   │   │   ├── doctor_summary.py       # Doctor consultation brief schemas
│   │   │   ├── medicine.py             # Medicine catalog & ambiguity schemas
│   │   │   ├── medication.py           # Reminder schedule & dose history schemas
│   │   │   └── health.py               # Chronic disease guide schemas
│   │   ├── services/
│   │   │   ├── ollama_service.py       # Gemma 3:4B Ollama adapter & structured JSON parser
│   │   │   ├── triage_rules.py         # Hardcoded conservative emergency triage rules
│   │   │   ├── symptom_analyzer.py     # Cautious urgency recommendation engine
│   │   │   ├── medicine_service.py     # Drug catalog search & ambiguity resolver
│   │   │   ├── condition_service.py    # Evidence-based precaution provider
│   │   │   └── doctor_summary_gen.py   # Consultation script and report generator
│   │   └── routers/
│   │       ├── symptoms.py             # /api/symptoms/analyze, /api/symptoms/doctor-summary
│   │       ├── medicines.py            # /api/medicines/search, /api/medicines/{id}
│   │       ├── medications.py          # /api/medications (CRUD, dose-logs, reminders)
│   │       └── health.py               # /api/health/conditions
│   ├── tests/
│   │   ├── conftest.py                 # Automated offline test fixtures for Ollama
│   │   ├── test_ollama_service.py      # Ollama adapter, error states, and safety rule tests
│   │   ├── test_symptoms.py            # Emergency rules, ordinary symptoms, missing info tests
│   │   ├── test_medicines.py           # Drug search, ambiguity handling, safety tests
│   │   ├── test_medications.py         # Reminder persistence, dose tracking tests
│   │   └── test_doctor_summary.py      # Consultation script generation tests
│   ├── .env.example
│   ├── requirements.txt
│   └── run.py                          # 1-click Python backend starter
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── common/
│   │   │       ├── EmergencyBanner.tsx # Persistent top red flag emergency banner
│   │   │       ├── DisclaimerBanner.tsx# Clinical disclaimer banner
│   │   │       ├── Navbar.tsx          # Responsive mobile-friendly navigation
│   │   │       ├── Footer.tsx          # Medical sources & privacy links
│   │   │       └── Toast.tsx           # Feedback toast notifications
│   │   ├── context/
│   │   │   └── MedicationContext.tsx   # React state for reminders, doses, and notifications
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx         # Welcome hero, 4 pillars, demo scenario shortcuts
│   │   │   ├── DashboardPage.tsx       # Today's dose checklist, history, emergency quick dial
│   │   │   ├── SymptomCheckerPage.tsx  # Natural language symptom triage form with real-time alert
│   │   │   ├── SymptomResultsPage.tsx  # Urgency recommendation card & possible explanations
│   │   │   ├── DoctorSummaryPage.tsx   # Patient speaking script, print layout, copy/edit
│   │   │   ├── MedicineExplainerPage.tsx# 12-section plain-language medicine monographs
│   │   │   ├── MedicationSchedulePage.tsx# Medication schedule manager & dose logging
│   │   │   ├── HealthPrecautionsPage.tsx# Chronic condition precautions (Diabetes, BP, Asthma)
│   │   │   └── PrivacySettingsPage.tsx # Data minimization, export JSON, delete local data
│   │   ├── services/
│   │   │   └── api.ts                  # Type-safe client for all FastAPI endpoints
│   │   ├── types/
│   │   │   └── index.ts                # TypeScript entity and DTO definitions
│   │   ├── utils/
│   │   │   ├── emergencyRules.ts       # Instant client-side red flag warning detector
│   │   │   └── notificationHelper.ts   # Web Notifications API with permission management
│   │   ├── App.tsx                     # React Router routes and provider shell
│   │   ├── main.tsx
│   │   └── index.css                   # Tailwind styles, print styling
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── .env.example
│
├── start-all.ps1                       # Launch both frontend & backend simultaneously (PowerShell)
├── start-backend.bat                   # 1-click backend runner (Windows)
├── start-frontend.bat                  # 1-click frontend runner (Windows)
└── README.md
```

---

## ⚡ Setup & Run Instructions for Gemma 3:4B

Follow these exact steps to run Medisense locally with **Google Gemma 3:4B**:

### Step 1: Install Ollama
Download and install Ollama for your operating system:
- **Windows / macOS / Linux:** [https://ollama.com/download](https://ollama.com/download)
- Or on Linux terminal:
  ```bash
  curl -fsSL https://ollama.com/install.sh | sh
  ```

### Step 2: Start the Ollama Service
Ensure the Ollama background daemon is running:
```bash
ollama serve
```
*(On Windows or macOS with the desktop app installed, Ollama starts automatically in the system tray).*

### Step 3: Download the Gemma 3:4B Model
In your terminal, pull the required model tag:
```bash
ollama pull gemma3:4b
```

### Step 4: Verify Model Availability
Verify that `gemma3:4b` is present and ready:
```bash
ollama list
```
You should see:
```text
NAME         ID              SIZE      MODIFIED
gemma3:4b    ...             ...       ...
```

### Step 5: Configure Backend Environment Variables
In `medisense/backend/`, ensure `.env` is configured with:
```ini
AI_PROVIDER=ollama
AI_MODEL=gemma3:4b
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_TIMEOUT_SECONDS=30.0
```
> [!TIP]
> If you ever need to run in offline testing mode without Ollama, simply change `AI_PROVIDER=demo`.

### Step 6: Start the Backend API Server
Open a terminal:
```bash
cd medisense/backend

# (Optional) Virtual environment
python -m venv venv
venv\Scripts\activate      # On Windows
# source venv/bin/activate # On Mac/Linux

pip install -r requirements.txt
python run.py
```
- API is running at: **`http://127.0.0.1:8000`**
- Health-check endpoint: **`http://127.0.0.1:8000/api/health-check`**
- Interactive Swagger docs: **`http://127.0.0.1:8000/docs`**

### Step 7: Start the Frontend Application
Open a second terminal:
```bash
cd medisense/frontend
npm install
npm run dev
```
- Web Application is running at: **`http://localhost:5173`**

### Step 8: Test Each Major Feature
1. **Symptom Checker (`/symptom-checker`):** Enter *"I have a mild tension headache and fatigue for 2 days."* Verify that Gemma 3:4B analyzes symptoms and displays educational guidance with `Mode: AI Safety Evaluated`.
2. **Emergency Shield (`/symptom-checker`):** Enter *"crushing chest pain"*. Verify the red banner pops up immediately and assigns `EMERGENCY_CARE` (112 India / 911 USA) without waiting for Ollama.
3. **Doctor Summary ("What Should I Tell My Doctor?", `/doctor-summary`):** Enter your concerns and click *Generate Consultation Summary*. Verify that an empathetic, articulate first-person patient speaking script is generated with questions for your doctor.
4. **Medicine Explainer (`/medicines`):** Search for *"Paracetamol"* or *"Amoxicillin"*. Verify the 12-section verified monograph is loaded from the curated database.
5. **Ambiguity Guardrail (`/medicines`):** Search for *"painkiller"* or *"cough syrup"*. Verify that Medisense prompts you to specify the active ingredient or package name.
6. **Medication Schedule & Reminders (`/medications`):** Add a scheduled medicine, log today's dose as taken, and verify adherence tracking and browser notification controls.

---

## 🧪 Running Automated Tests

The backend includes **29 automated tests** covering both the existing safety infrastructure and the new Ollama adapter. Automated tests use mocked Ollama responses in `conftest.py` so the test suite passes 100% offline without needing Ollama running or the model downloaded.

To run the test suite:
```bash
cd medisense/backend
python -m pytest tests -v
```

**Test Suite Coverage Summary (29 Passed):**
- `test_ollama_service.py` (16 tests):
  - JSON sanitization & markdown fence extraction
  - Connection failure handling (clean HTTP 503 instructing `ollama serve`)
  - Missing model handling (clean HTTP 503 instructing `ollama pull gemma3:4b`)
  - Timeout handling (clean HTTP 504)
  - Empty message and malformed response handling (clean HTTP 502)
  - Gemma 3:4B symptom assessment schema validation
  - Emergency safety rule bypass (cannot be overridden by LLM)
  - Baseline safety floor downgrade prevention
  - Gemma 3:4B doctor consultation brief generation
- `test_symptoms.py` (6 tests):
  - Acute chest pain emergency triage
  - Stroke symptoms FAST protocol emergency triage
  - Infant high fever pediatric emergency triage
  - Prolonged fever routing to *See a Doctor Soon*
  - Mild headache home care recommendation
  - Missing symptom info follow-up generation
- `test_doctor_summary.py` (2 tests):
  - Speaking script generation and question compilation
  - Missing clinical information tracking
- `test_medicines.py` (4 tests):
  - Verified medicine search & active ingredient lookup
  - Ambiguous keyword interception (*"painkiller"*)
  - Full pharmaceutical monograph retrieval
  - Unknown drug 404 response
- `test_medications.py` (1 test):
  - Medication CRUD, dose logging, adherence tracking, daily checklist

---

## 🌐 Production & Hosted Deployment Guide

### Critical Cloud Architecture Note:
A local Ollama instance running on `localhost:11434` is **NOT** reachable by a cloud-deployed website (e.g. Render, Railway, AWS). 

To use Gemma 3:4B with a deployed website:
1. **Provision an Ollama Inference Host:**
   - Deploy Ollama on a GPU/CPU virtual server (e.g., AWS EC2, GCP Compute Engine, RunPod, or a private VPS with at least 8GB RAM).
   - Run `ollama pull gemma3:4b`.
2. **Secure the Inference Endpoint:**
   - Place Ollama behind a private VPC, Tailscale VPN, or an authenticated reverse proxy (e.g., Caddy or Nginx with bearer token authentication).
   - **NEVER** expose an unauthenticated Ollama port `11434` to the public internet.
3. **Configure the Backend:**
   - Set `OLLAMA_BASE_URL=https://private-ollama.your-domain.internal` on your backend.
   - Keep `AI_PROVIDER=ollama` and `AI_MODEL=gemma3:4b`.
   - The frontend communicates **only** with the backend API (`VITE_API_BASE_URL`). The frontend never talks to Ollama directly.
4. **Fallback Option:**
   - If dedicated Ollama hosting is not available, set `AI_PROVIDER=demo` on the backend. Medisense will run fully and safely using its built-in clinical rule engine without any external dependency.

---

## ⚖️ Ethical & Privacy Declaration

Medisense was engineered strictly adhering to patient safety ethics, conservative triage principles, and verified data separation. Developed for educational and supportive healthcare literacy purposes.
