// src/components/AIChatBot.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { aiAPI } from '../../utils/api';

const DOCTOR_CATEGORIES = [
  { name: "Cardiologist", slug: "cardiologist", desc: "Heart & cardiovascular diseases" },
  { name: "Dermatologist", slug: "dermatologist", desc: "Skin, hair & nail conditions" },
  { name: "Neurologist", slug: "neurologist", desc: "Brain, spine & nervous system" },
  { name: "Orthopedic", slug: "orthopedic", desc: "Bones, joints & muscles" },
  { name: "Gastroenterologist", slug: "gastroenterologist", desc: "Digestive system" },
  { name: "Pediatrician", slug: "pediatrician", desc: "Health care for children" },
  { name: "Psychiatrist", slug: "psychiatrist", desc: "Mental health disorders" },
  { name: "Ophthalmologist", slug: "ophthalmologist", desc: "Eye conditions" },
  { name: "ENT Specialist", slug: "ent", desc: "Ear, nose & throat" },
  { name: "Gynecologist", slug: "gynecologist", desc: "Women's reproductive health" },
  { name: "Urologist", slug: "urologist", desc: "Urinary tract & kidney" },
  { name: "General Physician", slug: "general", desc: "Common illnesses & general checkups" },
];

const SYSTEM_PROMPT = `You are a medical assistant for a doctor booking app.
Categories: ${DOCTOR_CATEGORIES.map(d => d.name).join(", ")}.
Analyze symptoms, recommend the best category, and end with [RECOMMEND:CategoryName].`;

export default function AIChatBot() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hello! 👋 Describe your symptoms and I'll find the right doctor for you." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setInput("");
    setLoading(true);

    const newHistory = [...history, { role: "user", parts: [{ text: userText }] }];
    setMessages(prev => [...prev, { role: "user", text: userText }]);

    try {
      let reply = null;
      let recommended = null;
      let cleanReply = null;

      try {
        const formattedHistory = newHistory.map(msg => ({
          role: msg.role === "model" ? "assistant" : msg.role,
          content: msg.parts?.[0]?.text || ""
        }));
        const res = await aiAPI.ollamaChat(formattedHistory);
        reply = res.data?.message;
        const recommendation = res.data?.recommendation;
        if (recommendation?.specialty_name) {
          recommended = DOCTOR_CATEGORIES.find(
            (d) => d.name.toLowerCase() === recommendation.specialty_name.toLowerCase().trim()
          );
        }
      } catch (directError) {
        console.warn('Ollama chat unavailable, falling back to backend AI route.', directError);
      }

      if (!reply) {
        const res = await aiAPI.symptomCheck(newHistory, SYSTEM_PROMPT);
        reply = res.data?.candidates?.[0]?.content?.parts?.[0]?.text || "Please try again.";
        const match = reply.match(/\[RECOMMEND:([^\]]+)\]/);
        cleanReply = reply.replace(/\[RECOMMEND:[^\]]+\]/g, "").trim();
        recommended = match
          ? DOCTOR_CATEGORIES.find(d => d.name.toLowerCase() === match[1].toLowerCase().trim())
          : null;
        reply = cleanReply;
      }

      const finalReply = cleanReply || reply;
      setHistory([...newHistory, { role: "model", parts: [{ text: finalReply }] }]);
      setMessages(prev => [...prev, { role: "ai", text: finalReply, recommended }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        role: "ai",
        text: "Something went wrong. Please try again."
      }]);
    }

    setLoading(false);
  };

  return (
    <div className="chatbot-container">
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <p>{msg.text}</p>
            {msg.recommended && (
              <div className="doctor-card">
                <h4>{msg.recommended.name}</h4>
                <p>{msg.recommended.desc}</p>
                <button onClick={() => navigate(`/doctors?specialty=${msg.recommended.slug}`)}>
                  View {msg.recommended.name}s →
                </button>
              </div>
            )}
          </div>
        ))}
        {loading && <div className="typing">AI is thinking...</div>}
      </div>
      <div className="input-row">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Describe your symptoms..."
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading}>
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}