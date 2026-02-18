import express from 'express'
import cors from 'cors'
import * as dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import * as http from 'node:http'
import { WebSocketServer } from 'ws'

import authRoutes from './routes/auth.js'
import taskRoutes from './routes/tasks.js'
import orgRoutes from './routes/org.js'

dotenv.config()

const app = express()
const server = http.createServer(app)
const wsServer = new WebSocketServer({ server })

wsServer.on('connection', (socket) => {
    console.log('WebSocket client connected')
    socket.on('message', (data) => {
        console.log('Received:', data.toString())
    })
})

app.use(express.json())
app.use(
    cors({
        origin: 'http://localhost:5173',
        credentials: true,
    })
)
app.use(cookieParser())
app.use(authRoutes)
app.use(orgRoutes)
app.use(taskRoutes)

server.listen(3333, () => {
    console.log("We're connected \n http://localhost:3333")
})
