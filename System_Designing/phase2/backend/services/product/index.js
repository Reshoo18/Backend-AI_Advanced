import express from "express"
import dotenv from "dotenv"


const app=express()
dotenv.config()
app.use(express.json())

const PORT=process.env.PORT||5000

app.get('/',(req,res)=>{
    res.send(`server is running hello server ${process.env.SERVER_NAME}`)
})


app.listen(PORT,()=>{
    
    console.log(`Server are listening at this PORT ${PORT}`)
})