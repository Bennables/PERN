import OpenAI from 'openai'
import { refreshTokens, getUserID } from '../helpers/helpers.js'
import { prisma } from '../lib/prisma.js'
import 'dotenv/config'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const connect = async (req, res) => {
    res.send("WE'RE CONNECTED")
}

const getTasks = async (req, res) => {
    const user = req.user

    const userRecord = await prisma.users.findUnique({
        where: { username: user },
        select: { ID: true },
    })
    if (!userRecord) {
        return res.status(404).json({ error: true, message: 'User not found' })
    }
    const user_id = userRecord.ID

    const tasks = await prisma.ordering.findMany({
        where: { user_id },
        include: { task: true },
        orderBy: [{ task: { urgency: 'asc' } }, { ind: 'asc' }],
    })

    res.status(200).send({ message: 'success', tasks })
}

const getUsers = async (req, res) => {
    console.log(req.body)
    const users = await prisma.users.findMany()
    console.log(users)
    res.status(200).send("we're good. don't worry")
}

const new_refresh = async (req, res) => {
    const refreshToken = req.cookies.refreshToken
    console.log(req.cookies)
    // console.log("refresh token is " + refreshToken)

    if (
        !refreshToken ||
        refreshToken == undefined ||
        refreshToken == 'undefined'
    ) {
        console.log("token doesn't exist")
        res.status(401).send({ message: "token doesn't exist" })
        return
    }
    const refreshed = await refreshTokens(refreshToken)
    if (refreshed == null) {
        res.status(400).send({ message: "it doesn't exist yet" })
        return
    }
    res.cookie('refreshToken', refreshed[1], {
        sameSite: 'lax',
        httpOnly: true,
    })
    res.status(200).send({ message: 'refreshed', token: refreshed[0] })
}

const updateTasks = async (req, res) => {
    try {
        const userRecord = await prisma.users.findUnique({
            where: { username: req.user },
            select: { ID: true },
        })
        if (!userRecord) {
            return res
                .status(404)
                .json({ error: true, message: 'User not found' })
        }
        const user_id = userRecord.ID

        console.log(req.body)

        if (!req.body || req.body.length === 0) {
            console.log('No tasks to update')
            return res
                .status(400)
                .send({ message: 'No tasks provided for update' })
        }

        console.log('Updating tasks for user_id:', user_id)
        console.log('Tasks to update:', req.body.length)

        await prisma.$transaction([
            ...req.body.map((t: { task_id: number; urgency: number }) =>
                prisma.tasks.updateMany({
                    where: { ID: t.task_id, owner_id: user_id },
                    data: { urgency: t.urgency },
                })
            ),
            ...req.body.map((t: { task_id: number; index: number }) =>
                prisma.ordering.update({
                    where: {
                        user_id_task_id: { user_id, task_id: t.task_id },
                    },
                    data: { ind: t.index },
                })
            ),
        ])

        res.status(200).send({ message: 'Tasks updated successfully' })
    } catch (e) {
        console.log('Error updating tasks:', e)
        res.status(500).send({
            message: 'Failed to update tasks',
            error: (e as Error).message,
        })
    }
}

const updateTeamTasks = async (req, res) => {
    try {
        const userRecord = await prisma.users.findUnique({
            where: { username: req.user },
            select: { ID: true },
        })
        if (!userRecord) {
            return res
                .status(404)
                .json({ error: true, message: 'User not found' })
        }
        const user_id = userRecord.ID

        const orgMember = await prisma.org_Members.findFirst({
            where: { user_id },
            select: { org_id: true },
        })
        if (!orgMember) {
            return res
                .status(400)
                .send({ message: 'User is not part of any organization' })
        }
        const org_id = orgMember.org_id

        if (!req.body || req.body.length === 0) {
            console.log('No team tasks to update')
            return res
                .status(400)
                .send({ message: 'No tasks provided for update' })
        }

        console.log(
            'Updating team tasks for user_id:',
            user_id,
            'org_id:',
            org_id
        )
        console.log('Tasks to update:', req.body.length)

        await prisma.$transaction([
            ...req.body.map((t: { task_id: number; urgency: number }) =>
                prisma.tasks.updateMany({
                    where: { ID: t.task_id, org_id },
                    data: { urgency: t.urgency },
                })
            ),
            ...req.body.map((t: { task_id: number; index: number }) =>
                prisma.ordering.update({
                    where: {
                        user_id_task_id: { user_id, task_id: t.task_id },
                    },
                    data: { ind: t.index },
                })
            ),
        ])

        res.status(200).send({ message: 'Team tasks updated successfully' })
    } catch (e) {
        console.log('Error updating team tasks:', e)
        res.status(500).send({
            message: 'Failed to update team tasks',
            error: (e as Error).message,
        })
    }
}

const generateTasks = async (req, res) => {
    try {
        const { task_id, prompt } = req.body

        if (!prompt?.trim()) {
            return res.status(400).json({ message: 'prompt is required' })
        }
        if (!task_id) {
            return res.status(400).json({ message: 'task_id is required' })
        }

        const user_id = await getUserID(req.user)
        if (!user_id) {
            return res.status(404).json({ message: 'User not found' })
        }

        const task = await prisma.tasks.findUnique({
            where: { ID: Number(task_id) },
            include: {
                subTask: true,
                org: { include: { members: { where: { user_id } } } },
            },
        })

        if (!task) {
            return res.status(404).json({ message: 'Task not found' })
        }

        const hasAccess =
            task.owner_id === user_id ||
            (task.org && task.org.members.length > 0)

        if (!hasAccess) {
            return res.status(403).json({ message: 'Access denied' })
        }

        const taskContext = `Task: "${task.task_name}"${task.description ? `\nDescription: ${task.description}` : ''}${task.subTask?.length ? `\nExisting subtasks: ${task.subTask.map((s) => s.description).join(', ')}` : ''}\n`

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            max_tokens: 1024,
            messages: [
                {
                    role: 'system',
                    content: `You are a task management assistant that helps break down work into actionable subtasks.

You will be given a task context and a user request. You have two modes:

1. GENERATE: If the request gives you enough context to create meaningful, specific subtasks, respond ONLY with a JSON array of objects with "task_name" (string) and optionally "description" (string) fields. No other text.

2. CLARIFY: If the request is too vague, ambiguous, or lacks enough detail to generate useful subtasks, respond with a single concise clarifying question as plain text. Do not generate generic placeholder tasks — if you are not confident the subtasks would be genuinely useful, ask instead.

Use your judgement: a clear goal like "set up CI/CD pipeline" is enough to generate tasks. A vague request like "do the thing" or "help me" is not.`,
                },
                {
                    role: 'user',
                    content: `${taskContext}${prompt}`,
                },
            ],
        })

        const text = completion.choices[0]?.message?.content ?? ''

        let generated: { task_name: string; description?: string }[] = []
        try {
            const cleaned = text
                .replace(/^```(?:json)?\n?/, '')
                .replace(/\n?```$/, '')
            generated = JSON.parse(cleaned)
        } catch {
            return res.status(200).json({ clarification: text, tasks: [] })
        }

        console.log(generated)

        const subtasks = await prisma.$transaction(
            generated.map((t) =>
                prisma.sub_Task.create({
                    data: {
                        task_id: Number(task_id),
                        description: t.description
                            ? `${t.task_name}: ${t.description}`
                            : t.task_name,
                    },
                })
            )
        )

        res.status(200).json({ message: 'success', tasks: generated, subtasks })
    } catch (e) {
        console.error('Error generating tasks:', e)
        res.status(500).json({
            message: 'Failed to generate tasks',
            error: (e as Error).message,
        })
    }
}

export {
    connect,
    getTasks,
    getUsers,
    new_refresh,
    updateTasks,
    updateTeamTasks,
    generateTasks,
}
