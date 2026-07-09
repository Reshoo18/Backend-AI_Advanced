// add to git

import express from "express";
import dotenv from "dotenv"

const app=express();
dotenv.config();

const PORT=process.env.PORT || 5000;

app.get("/",(req,res)=>{
 res.send("hello i am server")
})

app.listen(PORT,()=>{
    console.log(`Server are listening at this port ${PORT}`)
})