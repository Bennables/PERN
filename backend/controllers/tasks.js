import { prisma } from "../lib/prisma.js";
import { getUserID } from "../helpers/helpers.js";

const getTasks = async (req, res) => {
    const user = req.user;

    const userRecord = await prisma.users.findUnique({
        where: { username: user }
    });

    if (!userRecord) {
        return res.status(404).json({ "error": true, "message": "User not found" });
    }

    const user_id = userRecord.ID;

    const tasks = await prisma.ordering.findMany({
        where: { user_id },
        include: {
            task: true
        },
        orderBy: [
            { task: { urgency: 'asc' } },
            { ind: 'asc' }
        ]
    });

    res.status(200).json({ "error": false, "message": "success", "tasks": tasks })
}

const updateTasks = async (req, res) => {
    try {
        const userRecord = await prisma.users.findUnique({
            where: { username: req.user }
        });

        if (!userRecord) {
            return res.status(404).json({ "error": true, "message": "User not found" });
        }

        const user_id = userRecord.ID;

        console.log(req.body);

        if (!req.body || req.body.length === 0) {
            console.log("No tasks to update");
            return res.status(400).json({ "error": true, "message": "No tasks provided for update" });
        }

        console.log("Updating tasks for user_id:", user_id);
        console.log("Tasks to update:", req.body.length);

        await prisma.$transaction(async (tx) => {
            for (const task of req.body) {
                await tx.tasks.update({
                    where: { ID: task.task_id },
                    data: { urgency: task.urgency }
                });
            }

            for (const task of req.body) {
                await tx.ordering.update({
                    where: {
                        user_id_task_id: {
                            user_id: user_id,
                            task_id: task.task_id
                        }
                    },
                    data: { ind: task.index }
                });
            }
        });

        res.status(200).json({ "error": false, "message": "Tasks updated successfully" })
    }
    catch (e) {
        console.log("Error updating tasks:", e)
        res.status(500).json({ "error": true, "message": "Failed to update tasks" })
    }
}

const getTeamTasks = async (req, res) => {
    const userRecord = await prisma.users.findUnique({
        where: { username: req.user }
    });

    if (!userRecord) {
        return res.status(404).json({ "error": true, "message": "User not found" });
    }

    const user_id = userRecord.ID;

    const org_member = await prisma.org_members.findFirst({
        where: { user_id }
    });

    if (!org_member) {
        return res.status(400).json({ "error": true, "message": "User is not part of any organization" });
    }

    const org_id = org_member.org_id;
    console.log("THE ORG ID IS: " + org_id);

    const teamTasks = await prisma.ordering.findMany({
        where: {
            user_id,
            task: {
                org_id
            }
        },
        include: {
            task: true
        },
        orderBy: [
            { task: { urgency: 'asc' } },
            { ind: 'asc' }
        ]
    });

    res.status(200).json({ "error": false, "message": "success", "tasks": teamTasks })
}

const updateTeamTasks = async (req, res) => {
    try {
        const userRecord = await prisma.users.findUnique({
            where: { username: req.user }
        });

        if (!userRecord) {
            return res.status(404).json({ "error": true, "message": "User not found" });
        }

        const user_id = userRecord.ID;

        const org_member = await prisma.org_members.findFirst({
            where: { user_id }
        });

        if (!org_member) {
            return res.status(400).json({ "error": true, "message": "User is not part of any organization" });
        }

        const org_id = org_member.org_id;

        if (!req.body || req.body.length === 0) {
            console.log("No team tasks to update");
            return res.status(400).json({ "error": true, "message": "No tasks provided for update" });
        }

        console.log("Updating team tasks for user_id:", user_id, "org_id:", org_id);
        console.log("Tasks to update:", req.body.length);

        await prisma.$transaction(async (tx) => {
            for (const task of req.body) {
                await tx.tasks.update({
                    where: { ID: task.task_id },
                    data: { urgency: task.urgency }
                });
            }

            for (const task of req.body) {
                await tx.ordering.update({
                    where: {
                        user_id_task_id: {
                            user_id: user_id,
                            task_id: task.task_id
                        }
                    },
                    data: { ind: task.index }
                });
            }
        });

        res.status(200).json({ "error": false, "message": "Team tasks updated successfully" });
    } catch (e) {
        console.log("Error updating team tasks:", e);
        res.status(500).json({ "error": true, "message": "Failed to update team tasks" });
    }
};

const createTask = async (req, res) => {
    try {
        const scope = req.body.scope;
        const taskName = req.body.name;
        const deadline = req.body.deadline ? new Date(req.body.deadline) : null;
        const urgency = parseInt(req.body.urgency, 10) || 1;

        if (scope == "personal") {
            const user_id = await getUserID(req.user);

            const result = await prisma.tasks.create({
                data: {
                    owner_id: user_id,
                    task_name: taskName,
                    deadline,
                    urgency,
                    ordering: {
                        create: {
                            user_id,
                            ind: 0
                        }
                    }
                }
            });

            res.status(201).json({ "error": false, "message": "Personal task created successfully", "task": result });
        }
        else {
            const user_id = await getUserID(req.user);

            let org_id = null;
            const org_member = await prisma.org_members.findFirst({
                where: { user_id }
            });

            if (org_member) {
                org_id = org_member.org_id;
            } else if (req.body.org_id) {
                org_id = Number(req.body.org_id);
                if (!Number.isFinite(org_id)) {
                    return res.status(400).json({ error: true, message: "Invalid org_id" });
                }

                await prisma.org_members.upsert({
                    where: {
                        org_id_user_id: {
                            org_id,
                            user_id
                        }
                    },
                    update: {},
                    create: {
                        org_id,
                        user_id
                    }
                })
            } else {
                return res.status(400).json({ error: true, message: "User is not part of any organization" });
            }

            const result = await prisma.tasks.create({
                data: {
                    org_id,
                    task_name: taskName,
                    deadline,
                    urgency,
                    ordering: {
                        create: {
                            user_id,
                            ind: 0
                        }
                    }
                }
            });
            const orgUsers = await prisma.org_members.findMany({
                where:{
                    org_id: org_id
                }
            });
            const lastByUser = await prisma.ordering.groupBy({
                by: ["user_id"],
                where: { user_id: { in: orgUsers.map(u => u.user_id) } },
                _max: { ind: true },
            });

            const maxMap = new Map(lastByUser.map(r => [r.user_id, r._max.ind ?? 0]));
            const createMany = await prisma.ordering.createMany({
                data: orgUsers.map((user) => ({
                task_id: result.ID,
                user_id: user.user_id,
                ind: (maxMap.get(user.user_id) ?? 0) + 1000
                })),
                skipDuplicates: true,
            })

            res.status(201).json({ "error": false, "message": "Team task created successfully", "task": result });
        }
    } catch (error) {
        console.log("Error creating task:", error);
        res.status(500).json({ "error": true, "message": "Failed to create task" });
    }
}

export { getTasks, updateTasks, getTeamTasks, updateTeamTasks, createTask };
