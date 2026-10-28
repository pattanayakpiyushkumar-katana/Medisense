# Medisense — AI-Powered Healthcare Web Application

> **"Understand Your Health. Make Informed Decisions."**

Medisense is a patient-centered health companion web application designed to help ordinary people understand their symptoms, determine appropriate levels of medical care, explore medicines in simple language, maintain daily medication schedules with reminders, and walk into doctor appointments prepared.

---

## 🏥 Clinical Safety & AI Guardrails Notice

> [!IMPORTANT]
> **Educational & Supportive Tool Only:** Medisense is designed for health literacy, triage safety, and doctor consultation preparation. It is **NOT** a replacement for a qualified medical doctor and does **NOT** provide definitive medical diagnoses or prescribe new pharmaceutical treatments.

### Key Clinical Safety Rules:
1. **Emergency-First Triage:** Hardcoded conservative clinical rules identify acute emergencies (chest pain, stroke symptoms, respiratory distress, anaphylaxis, infant high fever) and trigger immediate emergency advice (**112 in India, 911 in USA**) before and above any generative AI processing.
2. **Deterministic Clinical Demo Mode:** Operates fully out-of-the-box without requiring an external AI API key or network connectivity. When no API key is supplied, a deterministic clinical rule engine generates realistic, safe responses based on verified medical principles.
3. **No Fabricated Dosages or Diagnoses:** Drug information is retrieved exclusively from verified pharmaceutical compendiums (WHO Model List of Essential Medicines, CDSCO India, FDA). Unknown patient health history is explicitly labeled as *"Not provided"*, never guessed.
4. **Ambiguity Defense:** Vague search queries (e.g. *"painkiller"*, *"cough syrup"*, *"antibiotic"*) trigger proactive clarification prompts asking for the active ingredient or package label before providing guidance.

---

## 🚀 Technology Stack

- **Frontend:** React 19, TypeScript, Vite 8, React Router v7
- **Styling:** Tailwind CSS (Accessible contrast, mobile-first responsive design, print-friendly `@media print` support)
- **UI Icons:** Lucide React
- **Backend:** Python 3.13, FastAPI, Uvicorn
- **Data Validation:** Pydantic v2
- **Database:** SQLite (local zero-configuration storage) with clear migration path to PostgreSQL via SQLAlchemy
- **Testing:** Pytest & FastAPI TestClient (Backend suite of 13 automated tests) + Vite Production Build Bundler

---

## 📁 Project Structure

```text
medisense/
├── backend/
│   ├── app/
│   │   ├── config.py                   # Environment settings & emergency contacts
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

## ⚡ Quick Start Guide (Beginner Friendly)

### Prerequisites:
- **Python 3.10+** installed on your system.
- **Node.js 18+** installed on your system.

---

### Step 1: Start the Backend API Server

Open a terminal or command prompt:

```bash
# Navigate to the backend folder
cd medisense/backend

# (Optional) Create a virtual environment
python -m venv venv
venv\Scripts\activate      # On Windows
# source venv/bin/activate # On Mac/Linux

# Install backend dependencies
pip install -r requirements.txt

# Start the server
python run.py
```

*The backend server will start on **`http://127.0.0.1:8000`**.*
- Interactive Swagger API Documentation: **`http://127.0.0.1:8000/docs`**
- System Health Check: **`http://127.0.0.1:8000/api/health-check`**

---

### Step 2: Start the Frontend Application

Open a second terminal window:

```bash
# Navigate to the frontend folder
cd medisense/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

*The frontend application will start on **`http://localhost:5173`**.*
Open your web browser and navigate to **`http://localhost:5173`**.

---

### 💡 1-Click Launch on Windows:
Simply right-click `start-all.ps1` and choose **"Run with PowerShell"**, or double-click `start-backend.bat` followed by `start-frontend.bat`.

---

## 🧪 Running Automated Tests

### 1. Backend Pytest Suite:
The backend includes 13 comprehensive unit and integration tests covering:
- Immediate triage of acute chest pain, stroke symptoms, and infant high fevers
- Prolonged fever routing to *"See a Doctor Soon"*
- Mild tension headaches routed to supportive *"Home Care"*
- Missing symptom data generating targeted follow-up questions
- Medicine catalog lookup and ambiguous keyword detection (*"painkiller"*)
- Medication schedule CRUD, dose logging, and daily reminder checklist calculation
- Structured doctor consultation brief and speaking script generation

To execute the test suite:

```bash
cd medisense/backend
python -m pytest tests -v
```

**Expected output:**
```text
tests/test_doctor_summary.py::test_generate_doctor_consultation_summary PASSED
tests/test_doctor_summary.py::test_missing_info_marked_accurately PASSED
tests/test_medications.py::test_medication_crud_and_reminders PASSED
tests/test_medicines.py::test_search_verified_medicine PASSED
tests/test_medicines.py::test_search_ambiguous_keyword_triggers_guidance PASSED
tests/test_medicines.py::test_get_medicine_details PASSED
tests/test_medicines.py::test_unknown_medicine_returns_404 PASSED
tests/test_symptoms.py::test_emergency_triage_chest_pain PASSED
tests/test_symptoms.py::test_emergency_triage_stroke_signs PASSED
tests/test_symptoms.py::test_emergency_infant_fever PASSED
tests/test_symptoms.py::test_see_doctor_soon_prolonged_fever PASSED
tests/test_symptoms.py::test_mild_headache_home_care PASSED
tests/test_symptoms.py::test_uncertain_and_missing_info_generates_followup PASSED

======================== 13 passed in 1.45s ========================
```

### 2. Frontend Production Build Verification:
To verify that all TypeScript types, React components, and Tailwind styles compile without errors:

```bash
cd medisense/frontend
npm run build
```

---

## 🌟 Feature Walkthrough & Verification

### 1. Smart Symptom Checker (`/symptom-checker`)
- **Natural Language Input:** Type freeform sentences like *"I have had a mild headache since yesterday and feel tired."*
- **Real-Time Emergency Shield:** Type *"crushing chest pain"* or *"slurred speech"* — an **instant red alert card pops up dynamically before you even hit Submit**, warning you to call **112 / 911** immediately without delay.
- **Urgency Levels:** Categorized into:
  - 🔴 **Emergency Care:** Immediate emergency services required.
  - 🟠 **See a Doctor Soon:** Urgent care or prompt doctor visit within 24–48 hours.
  - 🔵 **Routine Medical Appointment:** Non-urgent general assessment.
  - 🟢 **Home Care and Monitoring:** Low-risk supportive self-care (hydration, rest) with red flags to monitor.

### 2. Possible Conditions & Diagnostic Suggestions (`/symptom-results`)
- Shows possible explanations labeled explicitly as possibilities rather than confirmed diagnoses.
- Displays typical symptoms vs. which of your reported symptoms match.
- Notes key missing information and uncertainty.
- Lists examinations a doctor might consider (e.g. cranial nerve exam, blood count) while explaining that the doctor determines necessity.

### 3. "What Should I Tell My Doctor?" (`/doctor-summary`)
- Synthesizes user symptoms into an articulate opening speaking script:
  > *"Doctor, my primary concern is Headache and fatigue. I have been noticing headache, tiredness, and mild fever. These symptoms started around yesterday and have been staying steady..."*
- Includes structured sections: Main concern, Onset, Progression, Severity (1-10), Associated symptoms, Background medical history, Current medicines, and Allergies.
- **Copy Script** button with one-click clipboard toast.
- **Edit Report** button allowing users to customize details before sharing.
- **Print / Save PDF** button with dedicated `@media print` clean formatting.

### 4. Medicine Explainer (`/medicines`)
- Search by brand name (*"Dolo 650"*, *"Brufen"*, *"Glycomet"*, *"Omez"*) or generic active ingredient (*"Paracetamol"*, *"Metformin"*, *"Amlodipine"*, *"Amoxicillin"*, *"ORS"*).
- **Ambiguity Guardrail:** Search *"painkiller"* or *"cough syrup"* to see the system catch the ambiguous term and request active ingredients.
- Displays 12 verified sections:
  1. Active ingredient & Brand names
  2. Common uses
  3. How it works (plain English)
  4. Common side effects
  5. Serious warning signs (when to call doctor)
  6. Important precautions
  7. Food instructions & meal timing
  8. Contraindications & drug interactions
  9. Storage directions
  10. Special populations (children, pregnancy, elderly, renal/hepatic)
  11. Questions to ask doctor or pharmacist
  12. Official source citations and verification date

### 5. Daily Medicine Reminders & Tracker (`/medications`)
- Add medication with custom reminder times (e.g. `08:00`, `20:00`), prescription instructions, and active days.
- **Today's Dose Checklist:** Mark doses as **Taken** or **Skipped** with real-time progress bar.
- **Browser Notifications:** Integrated with the Web Notifications API to trigger reminder alerts at scheduled dose times.
- **Adherence Statistics:** Calculates weekly compliance percentage and active streaks.
- **Missed Dose Protocol:** Clearly warns users to never double-dose and directs them to pharmacist instructions.

### 6. Disease-Specific Precautions (`/health-guides`)
- Deep-dive evidence-based guidance for Type 2 Diabetes, Hypertension, Bronchial Asthma, Migraine, and Acid Reflux (GERD).
- Daily precautions, red flag warning signs, lifestyle tips, and medication cautions.

### 7. Patient Privacy & Data Management (`/settings`)
- **Data Minimization:** No personal trackers, no advertising cookies.
- **Export Data:** Download all cached records as a JSON file with one click.
- **Right to Erasure:** Purge all stored records from the browser with one click.

---

## 🌐 API Documentation

FastAPI automatically serves interactive Swagger documentation at **`http://127.0.0.1:8000/docs`**.

### Key Endpoints:

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/symptoms/analyze` | Evaluates emergency red flags and assigns an urgency category |
| `POST` | `/api/symptoms/doctor-summary` | Generates structured consultation brief and patient speaking script |
| `GET` | `/api/symptoms/history` | Retrieves recent symptom triage history |
| `GET` | `/api/medicines/search?q={query}` | Searches drug catalog or flags ambiguous keywords |
| `GET` | `/api/medicines/{id}` | Retrieves full verified pharmaceutical monograph |
| `GET` | `/api/medications` | Lists active medications |
| `POST` | `/api/medications` | Creates a new medication schedule |
| `PATCH` | `/api/medications/{id}` | Updates medication properties |
| `DELETE` | `/api/medications/{id}` | Removes a medication |
| `POST` | `/api/medications/{id}/dose-log` | Records dose status (`taken`, `skipped`, `pending`) |
| `GET` | `/api/medications/reminders/today` | Calculates today's scheduled dose checklist |
| `GET` | `/api/medications/adherence/stats` | Computes adherence percentage and dose history |
| `GET` | `/api/health/conditions` | Lists chronic disease guides |
| `GET` | `/api/health-check` | Verifies server, database, and triage mode status |

---

## 🚢 Production Deployment Guide

### Deploying the Backend (e.g., Render, Railway, Fly.io):
1. Set Environment Variables:
   - `DATABASE_URL`: `sqlite:///./medisense.db` (or a PostgreSQL connection string: `postgresql://user:pass@host/dbname`).
   - `MEDISENSE_ENV`: `production`
   - `AI_PROVIDER`: `demo` (or `gemini` / `openai` with `AI_API_KEY`)
   - `CORS_ORIGINS`: Your frontend production URL (e.g., `https://my-medisense.vercel.app`)
2. Start Command:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

### Deploying the Frontend (e.g., Vercel, Netlify):
1. Build Command: `npm run build`
2. Output Directory: `dist`
3. Environment Variable:
   - `VITE_API_BASE_URL`: Your deployed backend URL (e.g., `https://medisense-api.onrender.com`)

---

## 🛠️ Troubleshooting Guide

- **PowerShell script execution disabled:** Run `npm.cmd` instead of `npm`, or start scripts using the provided `.bat` files.
- **Port 8000 or 5173 in use:**
  - Backend: Run `python run.py --port 8001` or set `PORT=8001` in `.env`.
  - Frontend: Vite will automatically offer the next available port (e.g., 5174).
- **Browser notifications not showing:** Ensure notification permission is set to "Allow" in your browser settings (look for the lock/settings icon in the address bar). Note that browser notifications require the tab or browser to remain active.

---

## ⚖️ License & Ethical Declaration

Medisense was built strictly adhering to patient safety ethics, conservative triage principles, and verified data separation. Developed for educational and supportive healthcare purposes.

