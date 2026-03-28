# 🏥 Clinical Note Summarizer

An AI-powered tool for healthcare providers to summarize clinical notes into structured SOAP-format summaries. Built with Python (FastAPI) + React, deployed on Microsoft Azure.

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- An OpenAI API key (for local dev) or Azure OpenAI resource (for production)

---

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

uvicorn main:app --reload
```

API will be running at: http://localhost:8000  
Swagger docs at: http://localhost:8000/docs

---

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will be running at: http://localhost:5173

---

## 🏗️ Architecture

```
User (React Frontend)
        ↓
  FastAPI Backend
        ↓
  OpenAI / Azure OpenAI
        ↓
  Structured SOAP Summary
```

---

## ☁️ Azure Deployment

- **Backend:** Azure App Service (Python)
- **Frontend:** Azure Static Web Apps
- **AI:** Azure OpenAI Service (GPT-4o)

See `/docs/azure-deployment.md` for step-by-step instructions.

---

## 📋 Features

- [x] Paste clinical notes and receive a structured SOAP summary
- [x] PDF upload support
- [ ] Azure deployment
- [ ] Authentication layer

---

## 🛡️ Disclaimer

This tool is intended to assist healthcare providers, not replace clinical judgment. All AI-generated summaries should be reviewed by a qualified professional.
