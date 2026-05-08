const express = require("express");
const router = express.Router();

router.post("/symptom-check", async (req, res) => {
  try {
    const { history, systemPrompt } = req.body;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: history,
        }),
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("AI route error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;