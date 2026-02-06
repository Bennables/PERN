import { prisma } from "../lib/prisma.js";
import { refreshTokens } from "../helpers/helpers.js";

const connect = async(req, res) => { 
    res.send("WE'RE CONNECTED");
}

const getTasks = async(req, res) =>{
    const user = req.user;

    const userRecord = await prisma.users.findUnique({
        where: { username: user }
    });

    if (!userRecord) {
        return res.status(404).send({"message": "User not found"});
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

    res.status(200).send({"message": "success", "tasks": tasks})
}

const getUsers = async  (req, res) =>{
    console.log(req.body);
    const data = await prisma.users.findMany();
    console.log(data);
    res.status(200).send("we're good. don't worry")
}

const new_refresh = async(req, res) =>{

    const refreshToken = req.cookies.refreshToken;
    console.log(req.cookies)
    // console.log("refresh token is " + refreshToken)

    if (!refreshToken || refreshToken == undefined || refreshToken == 'undefined'){
        console.log("token doesn't exist")
        res.status(401).send({'message': 'token doesn\'t exist'});
        return
    }
    const refreshed = await refreshTokens(refreshToken);
    if (refreshed == null){
        res.status(400).send({"message" : "it doesn't exist yet"})
        return
    }
    res.cookie("refreshToken", refreshed[1], {sameSite: 'lax', httpOnly: true})
    res.status(200).send({'message':"refreshed", "token": refreshed[0]})
}

const updateTasks = async(req, res) => {
    // updates the order of tasks.
    try{
        const userRecord = await prisma.users.findUnique({
            where: { username: req.user }
        });

        if (!userRecord) {
            return res.status(404).send({"message": "User not found"});
        }

        const user_id = userRecord.ID;

        console.log(req.body);

        // Check if there are tasks to update
        if (!req.body || req.body.length === 0) {
            console.log("No tasks to update");
            return res.status(400).send({"message": "No tasks provided for update"});
        }

        console.log("Updating tasks for user_id:", user_id);
        console.log("Tasks to update:", req.body.length);

        // Use Prisma transaction to update both tasks and ordering
        await prisma.$transaction(async (tx) => {
            // Update urgency for each task
            for (const task of req.body) {
                await tx.tasks.update({
                    where: { ID: task.task_id },
                    data: { urgency: task.urgency }
                });
            }

            // Update ordering indices
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

        res.status(200).send({"message" : "Tasks updated successfully"})
    }
    catch(e){
        console.log("Error updating tasks:", e)
        res.status(500).send({"message": "Failed to update tasks", "error": e.message})
    }
    
}

const updateTeamTasks = async (req, res) => {
    try {
        const userRecord = await prisma.users.findUnique({
            where: { username: req.user }
        });

        if (!userRecord) {
            return res.status(404).send({ "message": "User not found" });
        }

        const user_id = userRecord.ID;

        const org_member = await prisma.org_members.findFirst({
            where: { user_id }
        });

        if (!org_member) {
            return res.status(400).send({ "message": "User is not part of any organization" });
        }

        const org_id = org_member.org_id;

        if (!req.body || req.body.length === 0) {
            console.log("No team tasks to update");
            return res.status(400).send({ "message": "No tasks provided for update" });
        }

        console.log("Updating team tasks for user_id:", user_id, "org_id:", org_id);
        console.log("Tasks to update:", req.body.length);

        // Use Prisma transaction to update both tasks and ordering
        await prisma.$transaction(async (tx) => {
            // Update urgency for each task
            for (const task of req.body) {
                await tx.tasks.update({
                    where: { ID: task.task_id },
                    data: { urgency: task.urgency }
                });
            }

            // Update ordering indices
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

        res.status(200).send({ "message": "Team tasks updated successfully" });
    } catch (e) {
        console.log("Error updating team tasks:", e);
        res.status(500).send({ "message": "Failed to update team tasks", "error": e.message });
    }
};

export { connect, getTasks, getUsers, new_refresh, updateTasks, updateTeamTasks }