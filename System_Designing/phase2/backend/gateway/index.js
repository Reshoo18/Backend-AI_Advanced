import express from "express"
import dotenv from "dotenv"
import proxy from "express-http-proxy"


const app=express()
dotenv.config()
app.use(express.json())

const PORT=process.env.PORT||5000

app.get('/',(req,res)=>{
    res.send(`server is running hello server ${PORT}`)
})


app.use("/auth",proxy("//http://localhost:8001"))
app.use("/order",proxy("//http://localhost:8002"))
app.use("/product",proxy("//http://localhost:8003"))


app.listen(PORT,()=>{
    
    console.log(`Server are listening at this PORT ${PORT}`)
})