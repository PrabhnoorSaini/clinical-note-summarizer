import { useState, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import "./App.css";

const API_URL = "http://localhost:8000";

const SAMPLE_NOTE = `Patient: Margaret H., 78F
Date: 2024-11-12
Provider: Dr. Patel

S: Patient reports increased shortness of breath over the past 3 days, especially when climbing stairs. Also mentions mild ankle swelling bilaterally. Denies chest pain or fever. She has a history of CHF and hypertension. Currently on furosemide 40mg daily, lisinopril 10mg, and metoprolol 25mg BID. She mentions she ran out of furosemide 5 days ago.

O: BP 158/94, HR 88 bpm, RR 18, O2 sat 94% on room air, Temp 37.1C. Weight today 68kg vs 65kg last visit (3 weeks ago). Bilateral pitting edema +2 to the ankles. Mild crackles at lung bases bilaterally.

A: Likely acute decompensated CHF secondary to medication non-adherence (missed furosemide doses). Hypertension not at goal.

P: Restart furosemide 40mg daily — ensure patient has adequate supply. Counsel on medication adherence. Repeat weight in 48hrs. If no improvement or worsening symptoms, consider hospital admission. Refer to pharmacist for medication management support.`;

export default function App() {
  const [notes, setNotes] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [inputMode, setInputMode] = useState("text"); // "text" | "pdf"
  const [pdfFile, setPdfFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
    setCharCount(e.target.value.length);
  };

  const handleSubmit = async () => {
    if (inputMode === "text") {
      if (!notes.trim()) { setError("Please enter some clinical notes first."); return; }
      setError(""); setSummary(""); setLoading(true);
      try {
        const res = await axios.post(`${API_URL}/summarize`, { notes });
        setSummary(res.data.summary);
      } catch (err) {
        setError(err.response?.data?.detail || "Something went wrong. Is the backend running?");
      } finally { setLoading(false); }
    } else {
      if (!pdfFile) { setError("Please upload a PDF file first."); return; }
      setError(""); setSummary(""); setLoading(true);
      try {
        const formData = new FormData();
        formData.append("file", pdfFile);
        const res = await axios.post(`${API_URL}/upload-pdf`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSummary(res.data.summary);
      } catch (err) {
        setError(err.response?.data?.detail || "Something went wrong. Is the backend running?");
      } finally { setLoading(false); }
    }
  };

  const handleSample = () => {
    setNotes(SAMPLE_NOTE);
    setCharCount(SAMPLE_NOTE.length);
    setSummary("");
    setError("");
  };

  const handleClear = () => {
    setNotes(""); setSummary(""); setError("");
    setCharCount(0); setPdfFile(null);
  };

  const handleFileChange = (file) => {
    if (file && file.type === "application/pdf") {
      setPdfFile(file); setSummary(""); setError("");
    } else {
      setError("Please upload a valid PDF file.");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    handleFileChange(e.dataTransfer.files[0]);
  };

  const switchMode = (mode) => {
    setInputMode(mode); setSummary(""); setError("");
    setPdfFile(null); setNotes(""); setCharCount(0);
  };

  const isReady = inputMode === "text" ? notes.trim().length > 0 : pdfFile !== null;

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">⚕</span>
            <div>
              <h1 className="logo-title">ClinicalAI</h1>
              <p className="logo-sub">Note Summarizer</p>
            </div>
          </div>
          <div className="header-badge">Powered by GPT-4o</div>
        </div>
      </header>

      <main className="main">
        {/* Input Panel */}
        <section className="panel input-panel">
          <div className="panel-header">
            <h2 className="panel-title">Clinical Notes</h2>
            <div className="panel-actions">
              {inputMode === "text" && (
                <button className="btn btn-ghost" onClick={handleSample}>Load Sample</button>
              )}
              <button className="btn btn-ghost" onClick={handleClear}>Clear</button>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="mode-toggle">
            <button className={`mode-btn ${inputMode === "text" ? "active" : ""}`} onClick={() => switchMode("text")}>
              ✏️ Paste Text
            </button>
            <button className={`mode-btn ${inputMode === "pdf" ? "active" : ""}`} onClick={() => switchMode("pdf")}>
              📄 Upload PDF
            </button>
          </div>

          {/* Text Input */}
          {inputMode === "text" && (
            <textarea
              className="notes-input"
              placeholder="Paste raw clinical notes here — SOAP notes, discharge summaries, progress notes, etc."
              value={notes}
              onChange={handleNotesChange}
              spellCheck={false}
            />
          )}

          {/* PDF Upload */}
          {inputMode === "pdf" && (
            <div
              className={`drop-zone ${dragOver ? "drag-over" : ""} ${pdfFile ? "has-file" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                style={{ display: "none" }}
                onChange={(e) => handleFileChange(e.target.files[0])}
              />
              {pdfFile ? (
                <div className="file-info">
                  <span className="file-icon">📄</span>
                  <span className="file-name">{pdfFile.name}</span>
                  <span className="file-size">{(pdfFile.size / 1024).toFixed(1)} KB</span>
                </div>
              ) : (
                <div className="drop-prompt">
                  <span className="drop-icon">⬆️</span>
                  <p>Drag & drop a PDF here</p>
                  <p className="drop-sub">or click to browse</p>
                </div>
              )}
            </div>
          )}

          <div className="input-footer">
            {inputMode === "text" ? (
              <span className={`char-count ${charCount > 9000 ? "warn" : ""}`}>
                {charCount.toLocaleString()} / 10,000
              </span>
            ) : (
              <span className="char-count">PDF text will be extracted automatically</span>
            )}
            <button className="btn btn-primary" onClick={handleSubmit} disabled={loading || !isReady}>
              {loading ? (
                <span className="btn-loading"><span className="spinner" /> Summarizing...</span>
              ) : (
                "Generate Summary →"
              )}
            </button>
          </div>
          {error && <div className="error-banner">{error}</div>}
        </section>

        {/* Output Panel */}
        <section className={`panel output-panel ${summary ? "has-content" : ""}`}>
          <div className="panel-header">
            <h2 className="panel-title">Structured Summary</h2>
            {summary && (
              <button
                className="btn btn-ghost"
                onClick={() => navigator.clipboard.writeText(summary)}
              >
                Copy
              </button>
            )}
          </div>

          {!summary && !loading && (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p>Your structured SOAP summary will appear here.</p>
              <p className="empty-sub">Try loading the sample note to see it in action.</p>
            </div>
          )}

          {loading && (
            <div className="empty-state">
              <div className="pulse-ring" />
              <p>Analyzing clinical notes...</p>
              <p className="empty-sub">This usually takes 5–10 seconds.</p>
            </div>
          )}

          {summary && (
            <div className="summary-content">
              <ReactMarkdown>{summary}</ReactMarkdown>
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        ⚠️ AI-generated summaries are for assistance only. Always apply clinical judgment.
      </footer>
    </div>
  );
}