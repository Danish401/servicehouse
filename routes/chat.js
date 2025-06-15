
const express = require("express");
const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const router = express.Router();

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const customResponses = {
  "what services do you offer":
    "We offer services like Mason, Gardner, Labour, Chef, Carpenter, Shifting, Electrician, Plumber, Painter, and Cleaning.",
  "how can i book a service":
    "To book any service, simply go to the category, choose the professional, and confirm your booking time.",
  "can i chat with my booked service provider":
    "Yes, you can chat 1-on-1 with your booked service professional from the app interface.",
  "how do i reschedule a booking":
    "Yes, go to your bookings and click on the 'Reschedule' option.",
  "what is included in premium support":
    "Our Premium plan offers priority support, dedicated call support, and faster responses. You can buy it from the Profile section.",
  "how do i locate my service professional":
    "You can click on 'Locate' under your booking details to open Google Maps and track the professional.",
  "how can i contact support":
    "You can contact House Service support at houseservicesup@gmail.com or +91-70092-36647.",
  "owner of the application":
    "The application is proudly owned and operated by Danish Ali.",
  queries:
    "For any queries, feel free to email us at houseservicesup@gmail.com or call us at +91-70092-36647.",
};

// Normalize function
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "") // remove punctuation
    .replace(/\s+/g, " ") // normalize spaces
    .trim();
}

router.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    if (!userMessage) {
      return res.status(400).json({ error: "Message is required" });
    }

    const normalizedMessage = normalize(userMessage);

    const matchedKey = Object.keys(customResponses).find((key) =>
      normalizedMessage.includes(key)
    );

    const customReply = matchedKey ? customResponses[matchedKey] : null;

    let geminiReply = "";
    if (!customReply) {
      const model = "models/gemini-1.5-flash";
      const contents = [{ role: "user", parts: [{ text: userMessage }] }];

      const result = await genAI.models.generateContentStream({
        model,
        contents,
        config: { responseMimeType: "text/plain" },
      });

      for await (const chunk of result) {
        if (chunk.text) geminiReply += chunk.text;
      }
    }

    const finalReply =
      customReply && geminiReply
        ? `${customReply}\n\n${geminiReply}`
        : customReply || geminiReply || "Sorry, I didn't understand that.";

    res.json(finalReply);
  } catch (err) {
    console.error("Gemini API Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
