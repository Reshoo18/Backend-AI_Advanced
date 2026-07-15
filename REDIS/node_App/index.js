import express from "express"
import dotenv from "dotenv"
import connectDb from "./config/db.js"
import User from "./model/user.model.js"

const app=express()
dotenv.config()
app.use(express.json())

const PORT=process.env.PORT||5000

app.get('/',(req,res)=>{
    res.send("server is running hello server")
})

app.post("/create",async(req,res)=>{
    try{

    const {name,email,password}=req.body
    const user= await User.create({name,email,password})

    res.status(201).json({success:true,message:"user created successfully",user})}
    
    catch(error){
        res.status(400).json({success:false,message:"User cant added"})
    }
})

app.get("/get",async(req,res)=>{
    try{

    
    const user= await User.find({})

    res.status(200).json(user)}
    
    catch(error){
        res.status(400).json({success:false,message:"User cant added",error: error.message})
    }
})
  
app.listen(PORT,()=>{
     connectDb()
    console.log(`Server are listening at this PORT ${PORT}`)
})