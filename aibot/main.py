from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import httpx
import json
import re
import os
from dotenv import load_dotenv

load_dotenv()

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
MODEL = os.getenv("MODEL", "llama3.2")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")

app = FastAPI(title="Doctor Channeling AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DOCTOR_SPECIALTIES = [
    {"id": "gp",                "name": "General Practitioner (GP)",       "icon": "🩺", "description": "General health concerns, routine checkups"},
    {"id": "cardiology",        "name": "Cardiologist",                     "icon": "❤️",  "description": "Heart and cardiovascular diseases"},
    {"id": "dermatology",       "name": "Dermatologist",                    "icon": "🔬", "description": "Skin, hair, and nail conditions"},
    {"id": "neurology",         "name": "Neurologist",                      "icon": "🧠", "description": "Brain, spine, and nervous system"},
    {"id": "orthopedics",       "name": "Orthopedic Surgeon",               "icon": "🦴", "description": "Bones, joints, muscles, and ligaments"},
    {"id": "gastroenterology",  "name": "Gastroenterologist",               "icon": "🫁", "description": "Digestive system and stomach"},
    {"id": "pulmonology",       "name": "Pulmonologist",                    "icon": "🫧", "description": "Lungs and respiratory system"},
    {"id": "endocrinology",     "name": "Endocrinologist",                  "icon": "⚗️",  "description": "Hormones, diabetes, thyroid"},
    {"id": "psychiatry",        "name": "Psychiatrist",                     "icon": "🧘", "description": "Mental health and psychiatric disorders"},
    {"id": "ophthalmology",     "name": "Ophthalmologist",                  "icon": "👁️",  "description": "Eyes and vision problems"},
    {"id": "ent",               "name": "ENT Specialist",                   "icon": "👂", "description": "Ear, nose, and throat conditions"},
    {"id": "urology",           "name": "Urologist",                        "icon": "🔵", "description": "Urinary system and men's health"},
    {"id": "gynecology",        "name": "Gynecologist",                     "icon": "🌸", "description": "Women's reproductive health"},
    {"id": "pediatrics",        "name": "Pediatrician",                     "icon": "👶", "description": "Children's health and development"},
    {"id": "oncology",          "name": "Oncologist",                       "icon": "🎗️",  "description": "Cancer diagnosis and treatment"},
    {"id": "nephrology",        "name": "Nephrologist",                     "icon": "🫘", "description": "Kidney diseases and disorders"},
    {"id": "rheumatology",      "name": "Rheumatologist",                   "icon": "🦾", "description": "Autoimmune and joint diseases"},
    {"id": "hematology",        "name": "Hematologist",                     "icon": "🩸", "description": "Blood disorders and diseases"},
    {"id": "infectious_disease","name": "Infectious Disease Specialist",    "icon": "🦠", "description": "Infections, viruses, and bacteria"},
    {"id": "allergy",           "name": "Allergist / Immunologist",         "icon": "🌿", "description": "Allergies and immune system disorders"},
    {"id": "dental",            "name": "Dentist",                          "icon": "🦷", "description": "Teeth, gums, and oral health"},
    {"id": "physiotherapy",     "name": "Physiotherapist",                  "icon": "💪", "description": "Physical rehabilitation and therapy"},
    {"id": "vascular",          "name": "Vascular Surgeon",                 "icon": "🩻", "description": "Blood vessels and circulation"},
    {"id": "emergency",         "name": "Emergency Medicine",               "icon": "🚨", "description": "Urgent and emergency care"},
]

SYSTEM_PROMPT = """You are MedAssist, an intelligent medical triage assistant for a doctor channeling (appointment booking) platform in Sri Lanka. Your role is to:

1. Ask the patient about their symptoms in a conversational, empathetic manner
2. Gather relevant information: location of pain/discomfort, duration, severity (1-10), associated symptoms
3. Based on the symptoms, recommend the most appropriate doctor specialty from this list:
{specialties}

IMPORTANT RULES:
- You are NOT a doctor and cannot diagnose. Always clarify this.
- Be empathetic, clear, and professional
- Ask follow-up questions to understand symptoms better (max 3-4 questions before recommending)
- When you have enough info, provide a recommendation in this EXACT JSON format at the end of your message:
  RECOMMENDATION_JSON: {{"specialty_id": "id_from_list", "specialty_name": "Full Name", "confidence": "high/medium/low", "reason": "brief explanation", "urgency": "routine/soon/urgent/emergency"}}
- For emergency symptoms (chest pain with shortness of breath, stroke signs, severe trauma), ALWAYS recommend Emergency Medicine immediately
- Keep responses concise and friendly
- If the patient says something unrelated to medical symptoms, gently redirect them"""


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    message: str
    recommendation: Optional[dict] = None


def build_system_prompt():
    specialty_list = "\n".join(
        [f"- {s['id']}: {s['name']} ({s['description']})" for s in DOCTOR_SPECIALTIES]
    )
    return SYSTEM_PROMPT.format(specialties=specialty_list)


def extract_recommendation(text: str) -> Optional[dict]:
    match = re.search(r"RECOMMENDATION_JSON:\s*(\{[^}]+\})", text, re.DOTALL)
    if match:
        try:
            rec = json.loads(match.group(1))
            specialty = next((s for s in DOCTOR_SPECIALTIES if s["id"] == rec.get("specialty_id")), None)
            if specialty:
                rec["icon"] = specialty["icon"]
                rec["description"] = specialty["description"]
            return rec
        except json.JSONDecodeError:
            return None
    return None


def clean_message(text: str) -> str:
    text = re.sub(r"RECOMMENDATION_JSON:\s*\{[^}]+\}", "", text, flags=re.DOTALL)
    return text.strip()


@app.get("/specialties")
async def get_specialties():
    return {"specialties": DOCTOR_SPECIALTIES}


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        ollama_messages = [{"role": "system", "content": build_system_prompt()}]
        for msg in request.messages:
            ollama_messages.append({"role": msg.role, "content": msg.content})

        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{OLLAMA_BASE_URL}/api/chat",
                json={
                    "model": MODEL,
                    "messages": ollama_messages,
                    "stream": False,
                    "options": {"temperature": 0.7, "top_p": 0.9},
                },
            )

            if response.status_code != 200:
                raise HTTPException(status_code=500, detail=f"Ollama error: {response.text}")

            data = response.json()
            raw_message = data["message"]["content"]
            recommendation = extract_recommendation(raw_message)
            clean_msg = clean_message(raw_message)

            return ChatResponse(message=clean_msg, recommendation=recommendation)

    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail="Cannot connect to Ollama. Make sure Ollama is running on port 11434 with llama3 model pulled.",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health():
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            models = r.json().get("models", [])
            has_llama3 = any("llama3" in m.get("name", "") for m in models)
            return {
                "status": "ok",
                "ollama": "connected",
                "llama3_available": has_llama3,
                "models": [m.get("name") for m in models],
            }
    except Exception:
        return {"status": "ok", "ollama": "disconnected", "llama3_available": False}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
