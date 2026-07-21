import dotenv from "dotenv";

dotenv.config();

const response = await fetch(
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": process.env.GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: "What is JavaScript?",
            },
          ],
        },
      ],
    }),
  }
);

const data = await response.json();

console.log(response.status);
console.log(data);