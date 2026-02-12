import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

// Import controllers
import { login, register } from './controllers/account.js';
import { connect, getTasks, getUsers, new_refresh, updateTasks, updateTeamTasks } from './controllers/others.js';
import { verifyToken, getUserID, getUserOrgID } from './helpers/helpers.js';
import { prisma } from './lib/prisma.js';
import { redisClient } from './lib/redis.js';

const app = express();

dotenv.config();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173', // Vite default port
    credentials: true
}));
app.use(cookieParser());

// ===== PUBLIC ROUTES (No Authentication) =====
app.post("/login", login);
app.post("/register", register);
app.get("/auth/refresh", new_refresh);

// Find org by name (used before login)
app.get("/org/find", async (req, res) => {
    try {
        const name = (req.query.name || "").toString().trim();
        // console.log(req.query)
        // console.log(req)

        if (!name) {
            return res.status(400).send({ message: "Organization name is required" });
        }

        // Case-insensitive match using Prisma
        const result = await prisma.org.findFirst({
            where: {
                name: {
                    equals: name,
                    mode: 'insensitive'
                }
            },
            select: {
                ID: true,
                name: true
            }
        });

        if (!result) {
            return res.status(404).send({ message: "Organization not found" });
        }

        return res.status(200).send({ message: "found", org: result });
    } catch (error) {
        console.log("Error finding organization:", error);
        return res.status(500).send({ message: "Failed to find organization" });
    }
});

// ===== UTILITY ROUTES =====
app.get("/clear", (req, res) => {
    res.clearCookie("refreshToken");
    res.status(200).send({"message": "cookies have been cleared"});
});



const logout = async (req, res) => {
    console.log(req.body);
    console.log("LOGGED OUT")
    // console.log(req.body.token)
    console.log("REFREH IS" + req.cookies.refreshToken)

    if (!redisClient.isOpen) await redisClient.connect();
    // const result = await redisClient.sRem("refreshTokens", req.body.token);
    const result = await redisClient.sRem("refreshTokens", req.cookies.refreshToken);

    const tokesn = await redisClient.sMembers("refreshTokens");

    console.log("removed " + result)
    console.log(tokesn)
}

app.post("/logout", logout)
// ===== PROTECTED ROUTES (Authentication Required) =====
// Apply verifyToken middleware to all routes below
app.use(verifyToken);

app.get("/personal", connect);  // Test connection route
app.get("/personal/users", getUsers);  // Get all users (admin route?)



app.get("/tasks", getTasks)
app.put("/tasks", updateTasks)


const getTeamTasks = async(req, res) =>{
    // Get user's organization through org_members table
    const userRecord = await prisma.users.findUnique({
        where: { username: req.user }
    });

    if (!userRecord) {
        return res.status(404).send({"message": "User not found"});
    }

    const user_id = userRecord.ID;

    const org_member = await prisma.org_members.findFirst({
        where: { user_id }
    });
    
    if (!org_member) {
        return res.status(400).send({"message": "User is not part of any organization"});
    }
    
    const org_id = org_member.org_id;
    console.log(org_id)
    console.log("THE ORG ID IS: " + org_id);

    // Join ordering so org tasks respect per-user ordering
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

    res.status(200).send({"message": "success", "tasks": teamTasks})
}

app.get("/team", getTeamTasks);
app.put("/team/tasks", updateTeamTasks);

// ===== ORGANIZATION ROUTES =====
const createOrg = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            console.log("couldn't get from team")
            return res.status(400).send({ message: "Organization name is required" });
        }

        const orgName = name.trim();

        // Check for existing org name
        const existing = await prisma.org.findUnique({
            where: { name: orgName }
        });

        if (existing) {
            return res.status(400).send({ message: "Organization name already exists" });
        }

        const user_id = await getUserID(req.user);

        // Create org and add user as member in a transaction
        const created = await prisma.org.create({
            data: {
                name: orgName,
                members: {
                    create: {
                        user_id
                    }
                }
            }
        });

        res.status(201).send({ message: "Organization created", org_id: created.ID });
    } catch (error) {
        console.log("Error creating organization:", error);
        res.status(500).send({ message: "Failed to create organization" });
    }
};

app.post("/org", createOrg);


const createTask = async (req, res) =>{
    try {
        const scope = req.body.scope;
        const taskName = req.body.name;
        const deadline = req.body.deadline ? new Date(req.body.deadline) : null;
        const urgency = req.body.urgency || 1;

        if (scope == "personal"){
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
            
            res.status(201).send({"message": "Personal task created successfully", "task": result});
        }
        else{
            // Team task: prefer membership org, otherwise use org_id from client (selected on OrgFind)
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
                    return res.status(400).send({ message: "Invalid org_id" });
                }

                // Auto-join user to selected org (safe: PK prevents duplicates)
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
                });
            } else {
                return res.status(400).send({ message: "User is not part of any organization" });
            }
            
            // Insert team task
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

            res.status(201).send({"message": "Team task created successfully", "task": result});
        }
    } catch (error) {
        console.log("Error creating task:", error);
        res.status(500).send({"message": "Failed to create task", "error": error.message});
    }
}


app.post("/create", createTask)




app.listen(3333,  () => {
    console.log("We're connected \n http://localhost:3333");
});