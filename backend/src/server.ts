import express from 'express'
import cors from 'cors'
import * as dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import * as http from 'node:http'
import { Server as SocketIOServer } from 'socket.io'

import authRoutes from './routes/auth.js'
import taskRoutes from './routes/tasks.js'
import orgRoutes from './routes/org.js'


dotenv.config()

const app = express()
const server = http.createServer(app)
const io = new SocketIOServer(server, {
    cors: { origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true },
})

io.on('connection', (socket) => {
    console.log('Socket.IO client connected', socket.id)

    socket.on('chat:join', (convoId: string | number) => {
        const room = `convo:${convoId}`
        socket.join(room)
    })

    socket.on(
        'chat:message',
        (data: { convoId?: string | number; text: string }) => {
            const convoId = data.convoId
            const text = data.text ?? ''
            const payload = {
                text,
                message: text,
                conversationId: convoId,
                createdAt: new Date().toISOString(),
                senderSocketId: socket.id,
            }
            if (convoId != null) {
                io.to(`convo:${convoId}`).emit('chat:message', payload)
            } else {
                socket.emit('chat:message', payload)
            }
        }
    )

    socket.on('disconnect', () => {
        console.log('Socket.IO client disconnected', socket.id)
    })
})

app.use(express.json())
app.use(
    cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
    })
)
app.use(cookieParser())
app.use(authRoutes)
app.use(orgRoutes)
app.use(taskRoutes)

const port = Number(process.env.SERVER_PORT) || 3333
server.listen(port, () => {
    console.log("We're connected \n http://localhost:" + port)
})
