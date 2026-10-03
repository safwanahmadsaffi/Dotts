"""Dotty voice helper: POST /transcribe (raw webm/opus body) -> {text, ms}."""
import io
import os
import time

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from faster_whisper import WhisperModel

MODEL = os.environ.get("WHISPER_MODEL", "base.en")
THREADS = int(os.environ.get("WHISPER_THREADS", "8"))
MAX_BYTES = 5 * 1024 * 1024

# Words the demo uses that a small model may mishear.
PROMPT = (
    "Dotty, checking, savings, credit card, bill, prescription, refill, Lisinopril, "
    "blood pressure, pharmacy, allergies, grocery, milk, eggs, bread, pickup, delivery, "
    "Outlook, email."
)

model = WhisperModel(MODEL, device="cpu", compute_type="int8", cpu_threads=THREADS)
app = FastAPI()


@app.get("/health")
def health():
    return {"ok": True, "model": MODEL, "threads": THREADS}


@app.post("/transcribe")
async def transcribe(request: Request):
    audio = await request.body()
    if not audio:
        return JSONResponse({"error": "empty body"}, status_code=400)
    if len(audio) > MAX_BYTES:
        return JSONResponse({"error": "audio too large"}, status_code=413)
    start = time.perf_counter()
    try:
        segments, _info = model.transcribe(
            io.BytesIO(audio),
            language="en",
            beam_size=1,
            vad_filter=True,
            initial_prompt=PROMPT,
        )
    except Exception as exc:
        print(f"transcription failed: {type(exc).__name__}: {exc}", flush=True)
        return JSONResponse({"error": "transcription_failed"}, status_code=500)
    text = " ".join(s.text.strip() for s in segments).strip()
    return {"text": text, "ms": round((time.perf_counter() - start) * 1000)}
