import { prisma } from '../lib/prisma.js'
import { redisClient } from '../lib/redis.js'

const CACHE_LIMIT = 20

const addMessage = async (req, res) => {
    try {
        const taskId = parseInt(req.params.task_id, 10)
        const { message, role } = req.body

        if (isNaN(taskId)) {
            return res.status(400).json({ error: true, message: 'Invalid task ID' })
        }

        if (!message || !role) {
            return res.status(400).json({ error: true, message: 'message and role are required' })
        }

        const task = await prisma.tasks.findUnique({ where: { ID: taskId } })
        if (!task) {
            return res.status(404).json({ error: true, message: 'Task not found' })
        }

        const userRecord = await prisma.users.findUnique({
            where: { username: req.user },
            select: { ID: true },
        })

        const chat = await prisma.chat.upsert({
            where: { task_id: taskId },
            update: {},
            create: { task_id: taskId },
        })

        const chatMessage = await prisma.chat_Message.create({
            data: {
                chat_id: chat.ID,
                sender_id: userRecord?.ID ?? null,
                role,
                content: message,
            },
        })

        // Push to front of Redis list, trim oldest off the back
        const cacheKey = `chat:${taskId}`
        const entry = JSON.stringify({ role, content: message, createdAt: chatMessage.createdAt, sender_username: req.user })
        await redisClient.lPush(cacheKey, entry)

        const listLen = await redisClient.lLen(cacheKey)
        if (Number(listLen) > CACHE_LIMIT) {
            await redisClient.rPop(cacheKey)
        }

        res.status(201).json({ error: false, message: 'Message added', chatMessage })
    } catch (e) {
        console.log('Error adding chat message:', e)
        res.status(500).json({ error: true, message: 'Failed to add message' })
    }
}

const getChatHistory = async (req, res) => {
    try {
        const taskId = parseInt(req.params.task_id, 10)

        if (isNaN(taskId)) {
            return res.status(400).json({ error: true, message: 'Invalid task ID' })
        }

        const cacheKey = `chat:${taskId}`
        const cached = await redisClient.lRange(cacheKey, 0, -1)

        if (cached.length > 0) {
            const messages = cached.map((m) => JSON.parse(m.toString()))
            return res.status(200).json({ error: false, source: 'cache', messages })
        }

        // Cache miss — load last 20 from DB and repopulate
        const chat = await prisma.chat.findUnique({
            where: { task_id: taskId },
            include: {
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: CACHE_LIMIT,
                    include: { sender: { select: { username: true } } },
                },
            },
        })

        if (!chat) {
            return res.status(200).json({ error: false, source: 'db', messages: [] })
        }

        if (chat.messages.length > 0) {
            const entries = chat.messages.map((m) =>
                JSON.stringify({ role: m.role, content: m.content, createdAt: m.createdAt, sender_username: m.sender?.username ?? null })
            )
            await redisClient.rPush(cacheKey, entries)
        }

        const messages = chat.messages.map((m) => ({
            role: m.role,
            content: m.content,
            createdAt: m.createdAt,
            sender_username: m.sender?.username ?? null,
        }))

        res.status(200).json({ error: false, source: 'db', messages })
    } catch (e) {
        console.log('Error fetching chat history:', e)
        res.status(500).json({ error: true, message: 'Failed to fetch chat history' })
    }
}

export { addMessage, getChatHistory }
