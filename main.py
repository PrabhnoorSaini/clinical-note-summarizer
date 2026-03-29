from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from pypdf import PdfReader
import io
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Clinical Note Summarizer API")

# Allow React frontend to talk to the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://*.azurestaticapps.net"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

SYSTEM_PROMPT = """
You are a clinical documentation assistant helping healthcare providers in long-term and post-acute care settings.

When given raw clinical notes, extract and return a structured summary in the following format:

**Patient Summary**
- Patient Context: (age, relevant background if mentioned)

**Subjective**
- Chief Complaint:
- Patient-reported symptoms:

**Objective**
- Vitals (if present):
- Observations:

**Assessment**
- Diagnoses / Impressions:

**Plan**
- Medications:
- Follow-up actions:
- Referrals:

**Flags**
- Any urgent concerns or abnormal findings that need immediate attention.

Be concise, clinical, and accurate. Do not invent information not present in the notes.
"""

class NoteRequest(BaseModel):
    notes: str

class SummaryResponse(BaseModel):
    summary: str

@app.get("/")
def root():
    return {"status": "Clinical Note Summarizer API is running"}

@app.post("/summarize", response_model=SummaryResponse)
def summarize_notes(request: NoteRequest):
    if not request.notes.strip():
        raise HTTPException(status_code=400, detail="Notes cannot be empty.")

    if len(request.notes) > 10000:
        raise HTTPException(status_code=400, detail="Notes too long. Please limit to 10,000 characters.")

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Please summarize the following clinical notes:\n\n{request.notes}"}
            ],
            temperature=0.2,  # Low temperature for consistent, factual output
        )
        summary = response.choices[0].message.content
        return SummaryResponse(summary=summary)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

@app.post("/upload-pdf", response_model=SummaryResponse)
async def upload_pdf(file: UploadFile = File(...)):
    # Validate file type
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    # Read and extract text from PDF
    try:
        contents = await file.read()
        pdf = PdfReader(io.BytesIO(contents))
        extracted_text = ""
        for page in pdf.pages:
            extracted_text += page.extract_text() or ""
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read PDF: {str(e)}")

    if not extracted_text.strip():
        raise HTTPException(status_code=400, detail="No readable text found in PDF. It may be a scanned image.")

    if len(extracted_text) > 10000:
        extracted_text = extracted_text[:10000]

    # Reuse the same summarization logic
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Please summarize the following clinical notes:\n\n{extracted_text}"}
            ],
            temperature=0.2,
        )
        summary = response.choices[0].message.content
        return SummaryResponse(summary=summary)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")