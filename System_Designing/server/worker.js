import { Queue, Worker } from "bullmq";
import Redis from "ioredis";
import sendEmail from "./config/sendFile";

const connection=new Redis("redis://localhost:6379",{
    maxRetriesPerRequest:null
})
const worker=new Worker("emailQueue",(job)=>{
    console.log("job started")
    const email=job.data.email
    await sendEmail(email)
    console.log("job completed")
},{connection})