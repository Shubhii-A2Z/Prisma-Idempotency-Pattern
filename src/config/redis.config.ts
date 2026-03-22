import Redis from "ioredis";
import Redlock from "redlock";

const redisClient=new Redis();

const redLock=new Redlock([redisClient]); 

export {redisClient,redLock};