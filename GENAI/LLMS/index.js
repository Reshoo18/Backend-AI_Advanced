import express from 'express'
import dotenv from 'dotenv'
import {ChatGroq} from "@langchain/groq"
import { AIMessage } from '@langchain/core/messages'
import { StateGraph, Annotation, MessagesAnnotation, MemorySaver } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import {TavilySearch} from "@langchain/tavily"

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

const tool= new TavilySearch({
    maxResults:5,
    topic:"general"
}) 
const checkPOinter=new MemorySaver()
const tools=[tool]

const toolnode=new ToolNode(tools)

const llm=new ChatGroq({
    model: "openai/gpt-oss-120b",
    temperature:2
}).bindTools(tools)



const callLLM=async(state)=>{
    console.log("state",state)
     const response=await llm.invoke([{
        role:"system",
        content:"you are an ai assitant your name is jarvis"
    },
    ...state.messages

])
    return {messages:[response]}

}

const shouldContinue=async(state)=>{
    const lastMessage=state.messages[state.messages.length-1]
    if(lastMessage.tool_calls.length>0){
        return "tools"
    }else{
        return "__end__"
    }
}

const graph= new StateGraph(MessagesAnnotation)
    .addNode("agent",callLLM)
    .addNode("tools",toolnode)
    .addEdge("__start__","agent")
    .addEdge("tools","agent")
    
    .addConditionalEdges("agent",shouldContinue)

    .compile({checkpointer:checkPOinter})
    



app.post("/ai",async(req,res)=>{
    const {input}=req.body
    const response=await graph.invoke({messages:[
       { role:"user",
        content:input}
    ]},{configurable:{thread_id:"user123"}}
)
    console.log(response)
    res.status(200).json({"ai:":response.messages[response.messages.length-1].content})
})

app.get("/",(req,res)=>{
    res.send("hello i am server")
})

app.listen(PORT,()=>{
    console.log(`server at listening at this port ${PORT}`)
})