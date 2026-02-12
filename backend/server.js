import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

// Import controllers
import { login, register } from './controllers/account.js';
import { connect, getTasks, getUsers, new_refresh, updateTasks, updateTeamTasks } from './controllers/others.js';
import { createSubtask, updateSubtask, getSubtasks, deleteSubtask } from './controllers/subtasks.js';
import { verifyToken, getUserID, getUserOrgID } from './helpers/helpers.js';
import connection from './helpers/connect.js';
import { redisClient } from './helpers/redis.js';

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

        if (!name) {
            return res.status(400).send({ message: "Organization name is required" });
        }

        // Case-insensitive match
        const result = await connection.query(
            "SELECT id, name FROM org WHERE LOWER(name) = LOWER($1) LIMIT 1",
            [name]
        );

        if (result.rows.length === 0) {
            return res.status(404).send({ message: "Organization not found" });
        }

        return res.status(200).send({ message: "found", org: result.rows[0] });
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
    const user_id = (await connection.query("SELECT ID FROM users WHERE username=$1", [req.user])).rows[0].id;
    const org_result = await connection.query("SELECT org_id FROM org_members WHERE user_id=$1", [user_id]);
    
    if (org_result.rows.length === 0) {
        return res.status(400).send({"message": "User is not part of any organization"});
    }
    
    const org_id = org_result.rows[0].org_id;
    console.log(org_id)
    console.log("THE ORG ID IS: " + org_id);

    // Join ordering so org tasks respect per-user ordering
    const teamTasks = await connection.query(
        "SELECT tasks.id AS task_id, tasks.org_id, tasks.task_name, tasks.deadline, tasks.urgency, ordering.ind " +
        "FROM ordering INNER JOIN tasks ON tasks.id = ordering.task_id " +
        "WHERE ordering.user_id = $1 AND tasks.org_id = $2 " +
        "ORDER BY urgency, ind",
        [user_id, org_id]
    );
    // console.log(teamTasks)

    res.status(200).send({"message": "success", "tasks": teamTasks.rows})
}

app.get("/team", getTeamTasks);
app.put("/team/tasks", updateTeamTasks);

// ===== SUBTASK ROUTES =====
app.post("/subtasks", createSubtask);  // Create a new subtask
app.put("/subtasks/:id", updateSubtask);  // Update a subtask
app.get("/tasks/:task_id/subtasks", getSubtasks);  // Get all subtasks for a task
app.delete("/subtasks/:id", deleteSubtask);  // Delete a subtask

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
        const existing = await connection.query(
            "SELECT ID FROM org WHERE name = $1",
            [orgName]
        );

        if (existing.rows.length > 0) {
            return res.status(400).send({ message: "Organization name already exists" });
        }

        const user_id = await getUserID(req.user);

        // Create org
        const created = await connection.query(
            "INSERT INTO org (name) VALUES ($1) RETURNING ID",
            [orgName]
        );

        const org_id = created.rows[0].id;

        // Add current user as member
        await connection.query(
            "INSERT INTO org_members (org_id, user_id) VALUES ($1, $2)",
            [org_id, user_id]
        );

        res.status(201).send({ message: "Organization created", org_id });
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
        const deadline = req.body.deadline || null;
        const urgency = req.body.urgency || 1; //may need to parseint()

        if (scope == "personal"){
            const user_id = await getUserID(req.user);
            const result = await connection.query(
                "INSERT INTO tasks (owner_id, task_name, deadline, urgency) VALUES ($1, $2, $3, $4) RETURNING *", 
                [user_id, taskName, deadline, urgency] // Default to low priority (1)
            );
            
            // Also create ordering entry for the user
            await connection.query(
                "INSERT INTO ordering (user_id, task_id, ind) VALUES ($1, $2, $3)", 
                [user_id, result.rows[0].id, 0] // Default index 0
            );
            
            res.status(201).send({"message": "Personal task created successfully", "task": result.rows[0]});
        }
        else{
            // Team task: prefer membership org, otherwise use org_id from client (selected on OrgFind)
            const user_id = await getUserID(req.user);

            let org_id = null;
            const org_result = await connection.query("SELECT org_id FROM org_members WHERE user_id=$1", [user_id]);
            if (org_result.rows.length > 0) {
                org_id = org_result.rows[0].org_id;
            } else if (req.body.org_id) {
                org_id = Number(req.body.org_id);
                if (!Number.isFinite(org_id)) {
                    return res.status(400).send({ message: "Invalid org_id" });
                }

                // Auto-join user to selected org (safe: PK prevents duplicates)
                await connection.query(
                    "INSERT INTO org_members (org_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
                    [org_id, user_id]
                );
            } else {
                return res.status(400).send({ message: "User is not part of any organization" });
            }
            
            // Insert team task
            const result = await connection.query(
                "INSERT INTO tasks (org_id, task_name, deadline, urgency) VALUES ($1, $2, $3, $4) RETURNING *", 
                [org_id, taskName, deadline, urgency] // Default to low priority (1)
            );
            
            // Create ordering entry for this user and team task
            await connection.query(
                "INSERT INTO ordering (user_id, task_id, ind) VALUES ($1, $2, $3)",
                [user_id, result.rows[0].id, 0]
            );

            res.status(201).send({"message": "Team task created successfully", "task": result.rows[0]});
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