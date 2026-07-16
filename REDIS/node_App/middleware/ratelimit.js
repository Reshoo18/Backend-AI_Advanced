import { redis } from "../index.js"

const rateLimitter=async(req,res,next)=>{
    
    const id =req.id

    const key=`rate-limit:${id}`

    const request=await redis.incr(key)
    
    if(request==1){

       await redis.expire(key,60)
    }

    if(request>5){

        return res.status(429).json({"message":"Limit is exceed"})
    }
    
    next()
}

export default rateLimitter