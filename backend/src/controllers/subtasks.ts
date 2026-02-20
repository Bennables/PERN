import { getUserID } from '../helpers/helpers.js'
import { prisma } from '../lib/prisma.js'
import 'dotenv/config'
// Create a new subtask for a task
const createSubtask = async (req, res) => {
    try {
        const { task_id, description } = req.body

        if (!task_id) {
            return res
                .status(400)
                .send({ error: true, message: 'task_id is required' })
        }

        // Get user_id
        const user_id = await getUserID(req.user)

        if (!user_id) {
            return res
                .status(404)
                .send({ error: true, message: 'User not found' })
        }

        // Check if user has access to this task (either owns it or is in the org)
        const task = await prisma.tasks.findUnique({
            where: { ID: parseInt(task_id) },
            include: {
                org: {
                    include: {
                        members: {
                            where: { user_id },
                        },
                    },
                },
            },
        })

        if (!task) {
            return res
                .status(404)
                .send({ error: true, message: 'Task not found' })
        }

        // Check access: user owns task OR user is in task's org
        const hasAccess =
            task.owner_id === user_id ||
            (task.org && task.org.members.length > 0)

        if (!hasAccess) {
            return res
                .status(403)
                .send({ error: true, message: 'Access denied' })
        }

        // Create the subtask
        const result = await prisma.sub_Task.create({
            data: {
                task_id: parseInt(task_id),
                description: description || null,
            },
        })

        res.status(201).send({
            error: false,
            message: 'Subtask created successfully',
            subtask: result,
        })
    } catch (error) {
        console.log('Error creating subtask:', error)
        res.status(500).send({
            error: true,
            message: 'Failed to create subtask',
        })
    }
}

// Update an existing subtask
const updateSubtask = async (req, res) => {
    try {
        const { id } = req.params
        const { description } = req.body

        if (!id) {
            return res
                .status(400)
                .send({ error: true, message: 'Subtask ID is required' })
        }

        // Get user_id
        const user_id = await getUserID(req.user)

        if (!user_id) {
            return res
                .status(404)
                .send({ error: true, message: 'User not found' })
        }

        // Verify user has access to the task that owns this subtask
        const subtask = await prisma.sub_Task.findUnique({
            where: { ID: parseInt(id) },
            include: {
                task: {
                    include: {
                        org: {
                            include: {
                                members: {
                                    where: { user_id },
                                },
                            },
                        },
                    },
                },
            },
        })

        if (!subtask) {
            return res
                .status(404)
                .send({ error: true, message: 'Subtask not found' })
        }

        // Check access
        const hasAccess =
            subtask.task.owner_id === user_id ||
            (subtask.task.org && subtask.task.org.members.length > 0)

        if (!hasAccess) {
            return res
                .status(403)
                .send({ error: true, message: 'Access denied' })
        }

        // Update the subtask
        const result = await prisma.sub_Task.update({
            where: { ID: parseInt(id) },
            data: { description: description || null },
        })

        res.status(200).send({
            error: false,
            message: 'Subtask updated successfully',
            subtask: result,
        })
    } catch (error) {
        console.log('Error updating subtask:', error)
        res.status(500).send({
            error: true,
            message: 'Failed to update subtask',
        })
    }
}

// Get all subtasks for a specific task
const getSubtasks = async (req, res) => {
    try {
        const { task_id } = req.params

        if (!task_id) {
            return res
                .status(400)
                .send({ error: true, message: 'task_id is required' })
        }

        // Get user_id
        const user_id = await getUserID(req.user)

        if (!user_id) {
            return res
                .status(404)
                .send({ error: true, message: 'User not found' })
        }

        // Verify user has access to this task and get subtasks
        const task = await prisma.tasks.findUnique({
            where: { ID: parseInt(task_id) },
            include: {
                subTask: true,
                org: {
                    include: {
                        members: {
                            where: { user_id },
                        },
                    },
                },
            },
        })

        if (!task) {
            return res
                .status(404)
                .send({ error: true, message: 'Task not found' })
        }

        // Check access
        const hasAccess =
            task.owner_id === user_id ||
            (task.org && task.org.members.length > 0)

        if (!hasAccess) {
            return res
                .status(403)
                .send({ error: true, message: 'Access denied' })
        }

        res.status(200).send({
            error: false,
            message: 'success',
            subtasks: task.subTask,
        })
    } catch (error) {
        console.log('Error fetching subtasks:', error)
        res.status(500).send({
            error: true,
            message: 'Failed to fetch subtasks',
        })
    }
}

// Delete a subtask
const deleteSubtask = async (req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            return res
                .status(400)
                .send({ error: true, message: 'Subtask ID is required' })
        }

        // Get user_id
        const user_id = await getUserID(req.user)

        if (!user_id) {
            return res
                .status(404)
                .send({ error: true, message: 'User not found' })
        }

        // Verify user has access to the task that owns this subtask
        const subtask = await prisma.sub_Task.findUnique({
            where: { ID: parseInt(id) },
            include: {
                task: {
                    include: {
                        org: {
                            include: {
                                members: {
                                    where: { user_id },
                                },
                            },
                        },
                    },
                },
            },
        })

        if (!subtask) {
            return res
                .status(404)
                .send({ error: true, message: 'Subtask not found' })
        }

        // Check access
        const hasAccess =
            subtask.task.owner_id === user_id ||
            (subtask.task.org && subtask.task.org.members.length > 0)

        if (!hasAccess) {
            return res
                .status(403)
                .send({ error: true, message: 'Access denied' })
        }

        // Delete the subtask
        await prisma.sub_Task.delete({
            where: { ID: parseInt(id) },
        })

        res.status(200).send({
            error: false,
            message: 'Subtask deleted successfully',
        })
    } catch (error) {
        console.log('Error deleting subtask:', error)
        res.status(500).send({
            error: true,
            message: 'Failed to delete subtask',
        })
    }
}

export { createSubtask, updateSubtask, getSubtasks, deleteSubtask }
