import express from "express"
import dotenv from "dotenv"
import connectDb from "./config/db.js"
import User from "./model/user.model.js"
import Redis from "ioredis"
import rateLimitter from "./middleware/ratelimit.js"
import sendEmail from "./config/sendFile.js"
import emailQueue from "./queue.js"

const app=express()
dotenv.config()
app.use(express.json())

export const redis=new Redis(process.env.REDIS_URL)

const PORT=process.env.PORT||5000

app.get('/',(req,res)=>{
    res.send("server is running hello server")
})

app.post("/create",async(req,res)=>{
    try{

    const {name,email,password}=req.body
    await redis.del("user:all")
    const user= await User.create({name,email,password})

    await emailQueue.add("send-email",{email}) 

    res.status(201).json({success:true,message:"user created successfully",user})

    

}

   
    
    catch(error){
        res.status(400).json({success:false,message:"User cant added"})
    }
})

app.get("/get",rateLimitter,async(req,res)=>{
    try{

    
    const user= await User.find({})

    res.status(200).json(user)}
    
    catch(error){
        res.status(400).json({success:false,message:"User cant added",error: error.message})
    }
})


app.get("/get-with-redis",async(req,res)=>{
      
    const cached=await redis.get("user:all")

    if(cached){
        return  res.status(200).json(JSON.parse(cached))
    }

    const user=await User.find({});

    await redis.set("user:all",JSON.stringify(user))

    res.status(201).json(user)

})


app.post("/send-otp",async(req,res)=>{
    
    const {email}=req.body
     
    const otp=Math.floor(100000+Math.random()*900000).toString()
    await redis.set(`otp:${email}`,otp,"EX",100)

    return res.json({otp})

})
  

app.post("/verify-otp",async(req,res)=>{

    const {email,otp}=req.body

    const cachedOtp=await redis.get(`otp:${email}`)
    if(!cachedOtp){
      return  res.status(400).json({"message":"otp is invalid has been expired"})
    }

    if(cachedOtp !=otp){
       return res.status(400).json({"Message":"Incorrect opt"})
    }
     
    res.status(200).json({otp,"message":"Otp is correct"})
})
app.listen(PORT,()=>{
     connectDb()
    console.log(`Server are listening at this PORT ${PORT}`)
})