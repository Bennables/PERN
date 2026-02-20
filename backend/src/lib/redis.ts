import 'dotenv/config'

import * as redis from 'redis'

const redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
})
console.log(process.env.REDIS_URL)
redisClient.on('error', (err) => {
    console.log('There was an error connecting to redis: ' + err)
})

redisClient.on('ready', () => {
    console.log('redisClient is ready')
})

// Connect to Redis without blocking module export 
redisClient.connect().catch((err) => {
    console.log('Failed to connect to Redis:', err)
})

export { redisClient }
