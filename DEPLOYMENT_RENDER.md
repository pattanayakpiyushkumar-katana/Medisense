# 🚀 Deploying Medisense to Render (render.com)

This guide provides beginner-friendly, step-by-step instructions to deploy the **Medisense** full-stack healthcare web application to [Render](https://render.com).

---

## 📋 Overview of Deployment Methods

Render offers a generous **Free Tier**. Medisense supports two deployment methods:

| Method | Architecture | Complexity | Best For |
|---|---|---|---|
| **Method 1 (Recommended)** | **Render Blueprint (`render.yaml`)**<br>• Backend: Python Web Service<br>• Frontend: React Static Site | ⭐️ 1-Click | Clean separation of frontend and backend |
| **Method 2** | **Unified Single Web Service**<br>• Both frontend & backend run on 1 Web Service via `build.sh` | ⭐️ Easy | Saves free tier hours, zero CORS configuration |
| **Method 3** | **Manual Dashboard Setup**<br>• Create Web Service and Static Site manually in Render UI | ⭐️ Manual | If you want custom configuration without YAML |

---

## 📦 Step 1: Push Medisense to GitHub

Render connects directly to your GitHub or GitLab account.

1. Open your terminal and navigate to the project directory:
   ```bash
   cd c:\Users\user\.antigravity-ide\medisense
   ```

2. Initialize a Git repository and commit your files:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for Medisense deployment"
   ```

3. Create a **New Repository** on [GitHub](https://github.com/new) (e.g. named `medisense`).
4. Link your local project to GitHub and push:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/medisense.git
   git push -u origin main
   ```

---

## 🌟 Method 1: Automated 1-Click Deployment via Blueprint (Recommended)

Medisense comes pre-configured with a root `render.yaml` Blueprint file.

1. Log in to your [Render Dashboard](https://dashboard.render.com).
2. Click **Blueprints** in the top navigation bar.
3. Click **"New Blueprint Instance"**.
4. Select your `medisense` GitHub repository.
5. Render will automatically parse `render.yaml` and configure both services:
   - **`medisense-backend`** (Python Web Service running FastAPI)
   - **`medisense-frontend`** (Static Site running React + Vite)
6. Click **"Apply"**.
7. Render will build both services automatically!
   - Your frontend will be live at: `https://medisense-frontend.onrender.com`
   - Your backend API will be live at: `https://medisense-backend.onrender.com`

---

## 🛠️ Method 2: Unified Free Web Service (Single Service)

If you prefer to run both frontend and backend under a **single free Web Service** on Render:

1. In Render Dashboard, click **"New +"** → **"Web Service"**.
2. Connect your `medisense` GitHub repository.
3. Fill in the following settings:
   - **Name:** `medisense`
   - **Region:** Any (e.g., `Oregon (US West)` or `Frankfurt (EU)`)
   - **Branch:** `main`
   - **Root Directory:** *(leave blank / project root)*
   - **Runtime:** `Python 3`
   - **Build Command:**
     ```bash
     chmod +x build.sh && ./build.sh
     ```
   - **Start Command:**
     ```bash
     cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
   - **Instance Type:** `Free`
4. Expand **Environment Variables** and add:
   | Key | Value | Notes |
   |---|---|---|
   | `PYTHON_VERSION` | `3.11.9` | Ensures compatible Python environment |
   | `MEDISENSE_ENV` | `production` | Production mode |
   | `DATABASE_URL` | `sqlite:///./medisense.db` | Local SQLite database |
   | `AI_PROVIDER` | `demo` | Safe offline clinical engine (or `gemini` / `openai`) |
   | `CORS_ORIGINS` | `*` | Allows cross-origin requests |
5. Click **"Deploy Web Service"**.
   - FastAPI will automatically serve the built frontend at `https://medisense.onrender.com/` and the API at `https://medisense.onrender.com/api/...`!

---

## ⚙️ Method 3: Manual Dashboard Setup (Separate Services)

If you prefer to configure each service manually in the Render web interface:

### Part A: Deploy Backend Web Service
1. In Render Dashboard, click **"New +"** → **"Web Service"**.
2. Connect your `medisense` repository.
3. Configure:
   - **Name:** `medisense-backend`
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan:** `Free`
4. Add Environment Variables:
   - `PYTHON_VERSION`: `3.11.9`
   - `MEDISENSE_ENV`: `production`
   - `DATABASE_URL`: `sqlite:///./medisense.db`
   - `AI_PROVIDER`: `demo`
   - `CORS_ORIGINS`: `*`
5. Click **"Create Web Service"**. Copy your backend URL (e.g., `https://medisense-backend.onrender.com`).

### Part B: Deploy Frontend Static Site
1. In Render Dashboard, click **"New +"** → **"Static Site"**.
2. Connect the same `medisense` repository.
3. Configure:
   - **Name:** `medisense-frontend`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. Add Environment Variable:
   - `VITE_API_BASE_URL`: Paste your backend URL from Part A (e.g., `https://medisense-backend.onrender.com`)
5. In **Redirects / Rewrites**, add an SPA rewrite rule:
   - **Type:** `Rewrite`
   - **Source:** `/*`
   - **Destination:** `/index.html`
6. Click **"Create Static Site"**.

---

## 🔍 Post-Deployment Verification Checklist

Once Render finishes deploying:

- [ ] **Health Check:** Open `https://<YOUR-BACKEND>.onrender.com/api/health-check` in your browser. You should see:
  ```json
  {"status":"healthy","database":"sqlite_ready","mode":"demo"}
  ```
- [ ] **Interactive API Docs:** Open `https://<YOUR-BACKEND>.onrender.com/docs` to see Swagger UI.
- [ ] **Frontend UI:** Open `https://<YOUR-FRONTEND>.onrender.com/` to verify the Medisense landing page.
- [ ] **Symptom Checker Test:** Try typing a test scenario (e.g. *"I have a mild headache since yesterday"*).
- [ ] **Emergency Alert Test:** Type *"crushing chest pain"* to verify the immediate red flag emergency banner triggers.
- [ ] **Medicine Explainer:** Search for *"Paracetamol"* or *"Dolo 650"* to verify verified drug monographs load.
- [ ] **Daily Reminders:** Add a medication and log a dose to verify database persistence.

---

## 💡 Important Render Free Tier Tips

1. **Free Tier Cold Starts:** Render free web services automatically spin down into a sleep state after 15 minutes of inactivity. The very first request after sleeping may take 30–50 seconds to spin up. Subsequent requests will be fast.
2. **SQLite vs PostgreSQL on Render:**
   - By default, Medisense uses SQLite (`DATABASE_URL=sqlite:///./medisense.db`), which works immediately.
   - On Render's free tier, local disk files reset whenever a service restarts.
   - **For permanent persistence:** You can add a **Free PostgreSQL Database** in Render Dashboard with 1 click, copy the *Internal Database URL*, and set it as `DATABASE_URL` in your backend environment variables. Medisense's SQLAlchemy models will automatically initialize tables on PostgreSQL!
3. **Connecting External AI API:**
   - To connect Gemini or OpenAI, simply add `AI_PROVIDER=gemini` and `AI_API_KEY=your_key` in the Render backend environment variables. The clinical safety rules will remain active as the primary guardian.
