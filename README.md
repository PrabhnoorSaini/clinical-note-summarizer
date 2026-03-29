# 🏥 Clinical Note Summarizer

An AI-powered tool for healthcare providers to summarize clinical notes into structured SOAP-format summaries. Built with Python (FastAPI) + React, deployed on Microsoft Azure.

---

## 🌐 Live Demo

- **Frontend:** https://wonderful-hill-0f3362b0f.4.azurestaticapps.net
- **Backend API:** https://clinical-summarizer-api.azurewebsites.net
- **API Docs (Swagger):** https://clinical-summarizer-api.azurewebsites.net/docs

---

## 🏗️ Architecture
```
User (React Frontend — Azure Static Web Apps)
              ↓
   FastAPI Backend (Azure App Service)
              ↓
        OpenAI GPT-4o
              ↓
   Structured SOAP Summary
```

## ✨ Features

- [x] Paste raw clinical notes and receive a structured SOAP summary
- [x] PDF upload with drag & drop support
- [x] Backend deployed on Azure App Service
- [x] Frontend deployed on Azure Static Web Apps
- [x] CI/CD via GitHub Actions (auto-deploys on push to main)

---

## 🚀 Running Locally

### Prerequisites
- Python 3.11+
- Node.js 18+
- An OpenAI API key from https://platform.openai.com

### Backend
```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

uvicorn main:app --reload
```

API runs at: http://localhost:8000  
Swagger docs at: http://localhost:8000/docs

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:5173

---

## ☁️ Azure Deployment

| Component | Service |
|---|---|
| Backend (FastAPI) | Azure App Service (Python 3.12, Linux) |
| Frontend (React) | Azure Static Web Apps |
| AI Model | OpenAI GPT-4o |
| CI/CD | GitHub Actions |
| Region | Canada Central |

Deployments trigger automatically on every push to `main`.

---

## 🛡️ Disclaimer

This tool is intended to assist healthcare providers, not replace clinical judgment. All AI-generated summaries should be reviewed by a qualified professional.
