import express from 'express'
import dotenv from 'dotenv'
import { GoogleGenAI } from '@google/genai'
import OpenAI from "openai";
dotenv.config()
const app=express()

const PORT=3003
app.use(express.json())



const ai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

app.post('/ai',async(req,res)=>{
    const {contentt}=req.body
    const response = await ai.responses.create({
    model: "llama-3.3-70b-versatile",
    input: [
        {
            role: "system",
        content: `
You are an AI assistant named Jarvis.

Always introduce yourself at the beginning of every response by saying:
"Hey, I'm Jarvis."

After that, answer the user's question.`,

        },
      {
        role: "user",
        content:contentt
      },
    ]
});
res.status(200).json({"ai:-":response.output_text})
})




app.get("/",(req,res)=>{
    res.send("hello i am server")
})

app.listen(PORT,()=>{
    console.log(`server at listening at this port ${PORT}`)
})