import express from 'express'
import dotenv from 'dotenv'
import {ChatGroq} from "@langchain/groq"
import { AIMessage } from '@langchain/core/messages'
import { StateGraph, Annotation } from "@langchain/langgraph";

dotenv.config()
const app=express()

const PORT=3003
app.use(express.json())

// Without Langchain

// const ai = new OpenAI({
//     apiKey: process.env.GROQ_API_KEY,
//     baseURL: "https://api.groq.com/openai/v1",
// });

// app.post('/ai',async(req,res)=>{
//     const {contentt}=req.body
//     const response = await ai.responses.create({
//     model: "llama-3.3-70b-versatile",
//     input: [
//         {
//             role: "system",
//         content: `
// You are an AI assistant named Jarvis.

// Always introduce yourself at the beginning of every response by saying:
// "Hey, I'm Jarvis."

// After that, answer the user's question.`,

//         },
//       {
//         role: "user",
//         content:contentt
//       },
//     ]
// });
// res.status(200).json({"ai:-":response.output_text})
// })


// With LAngchain

const llm=new ChatGroq({
    model: "openai/gpt-oss-120b",
    temperature:2
})

const State=Annotation.Root({
   prompt:Annotation,
   AiMsg:Annotation

})

const callLLM=async(state)=>{
    console.log("state",state)
     const response=await llm.invoke([{
        role:"system",
        content:"you are an ai assitant your name is jarvis"
    },{
        role:"human",
        content:state.prompt
    }])
    return {AiMsg:response.content}

}

const graph= new StateGraph(State)
    .addNode("agent",callLLM)
    .addEdge("__start__","agent")
    .addEdge("agent","__end__")
    .compile()


app.post("/ai",async(req,res)=>{
    const {input}=req.body
    const response=await graph.invoke({prompt:input})
    console.log(response)
    res.status(200).json({"ai:":response})
})

app.get("/",(req,res)=>{
    res.send("hello i am server")
})

app.listen(PORT,()=>{
    console.log(`server at listening at this port ${PORT}`)
})