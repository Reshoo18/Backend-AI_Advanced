import express from 'express'
import dotenv from 'dotenv'
import {ChatGroq} from "@langchain/groq"
import fs from "fs"
import { PDFParse } from 'pdf-parse'
import {RecursiveCharacterTextSplitter} from "@langchain/textsplitters"
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import {QdrantVectorStore} from "@langchain/qdrant"
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
 

dotenv.config()
const app=express()

const PORT=3003
app.use(express.json())



const llm=new ChatGroq({
    model: "openai/gpt-oss-120b",
    temperature:2
})




const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-001", // 768 dimensions
  taskType: TaskType.RETRIEVAL_DOCUMENT,
  title: "Document title",
});

const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
  url: process.env.QDRANT_URL,
  collectionName: "grocery-store",
});


const upload=async()=>{
    const pdfpath="./knowledge.pdf"
    const buffer=fs.readFileSync(pdfpath)
    const pdfresult=new PDFParse({data:buffer})
    const result=await pdfresult.getText()
    const text=result.text
    const spliter=new RecursiveCharacterTextSplitter({
        chunkSize:500,
        chunkOverlap:100
    })
    const docs=await spliter.createDocuments([text])
    await vectorStore.addDocuments(docs)
}


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





app.post("/ai",async(req,res)=>{
    const {input}=req.body
    
    const docs=await vectorStore.similaritySearch(input,5)

    const context=docs.map((d)=>d.pageContent).join("\n\n");

    const response = await llm.invoke([
  new SystemMessage(`
You are a RAG AI Assistant.

Rules:
1. Answer ONLY from the CONTEXT.
2. Never use your own knowledge.
3. If the answer is not present in the context, reply exactly:
"I don't know based on the provided context."

Context:
${context}
`),

  new HumanMessage(input),
]);

    res.status(200).json({"ai:":response.content})

})


app.get("/",(req,res)=>{
    res.send("hello i am server")
})

app.listen(PORT,()=>{
    console.log(`server at listening at this port ${PORT}`)
})