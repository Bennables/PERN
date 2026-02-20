import { refreshTokens } from '../helpers/helpers.js'
import { prisma } from '../lib/prisma.js'

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

        const orgMember = await prisma.org_members.findFirst({
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

export {
    connect,
    getTasks,
    getUsers,
    new_refresh,
    updateTasks,
    updateTeamTasks,
}
