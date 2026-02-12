import redis from 'redis';


const redisClient = redis.createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379"
});

redisClient.on('error', (err) =>{
    console.log("There was an error connecting to redis: " + err)
})

redisClient.on('ready', ()=>{
    console.log("redisClient is ready");
})
await redisClient.connect();

export {redisClient};

