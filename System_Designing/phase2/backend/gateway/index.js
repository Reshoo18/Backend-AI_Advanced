import express from "express"
import dotenv from "dotenv"
import proxy from "express-http-proxy"


const app=express()
dotenv.config()
app.use(express.json())

const PORT=process.env.PORT||5000

app.get('/',(req,res)=>{
    res.send(`server is running hello server ${process.env.SERVER_NAME}`)
})


app.use("/auth",proxy("//http://auth-service:8001"))
app.use("/order",proxy("//http://order-service:8002"))
app.use("/product",proxy("//http://product-service:8003"))


app.listen(PORT,()=>{
    
    console.log(`Server are listening at this PORT ${PORT}`)
})