import { Redis } from "ioredis";
require ("dotenv").config();

const redisClient = ()=>{
    if(process.env.REDIS_URL){
        console.log(`redis conectaado`)
        return process.env.REDIS_URL;
    }
    throw new Error("conexipn fallida a redis");

};
export const redis = new Redis(redisClient());