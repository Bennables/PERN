import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

// Import controllers
import { login, register } from './controllers/account.js';
import { connect, getTasks, getUsers, new_refresh, updateTasks } from './controllers/others.js';
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

    const teamTasks = await connection.query("SELECT * FROM tasks WHERE org_id = $1 ORDER BY urgency", [org_id]);
    // console.log(teamTasks)

    res.status(200).send({"message": "success", "tasks": teamTasks.rows})
}

app.get("/team", getTeamTasks);


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
            // Get user's org through org_members table
            const user_id = (await connection.query("SELECT ID FROM users WHERE username=$1", [req.user])).rows[0].id;
            const org_result = await connection.query("SELECT org_id FROM org_members WHERE user_id=$1", [user_id]);
            
            if (org_result.rows.length === 0) {
                return res.status(400).send({"message": "User is not part of any organization"});
            }
            
            const org_id = org_result.rows[0].org_id;
            
            // Insert team task
            const result = await connection.query(
                "INSERT INTO tasks (org_id, task_name, deadline, urgency) VALUES ($1, $2, $3) RETURNING *", 
                [org_id, taskName, deadline, urgency] // Default to low priority (1)
            );
            
            res.status(201).send({"message": "Team task created successfully", "task": result.rows[0]});
        }
    } catch (error) {
        console.log("Error creating task:", error);
        res.status(500).send({"message": "Failed to create task", "error": error.message});
    }
}


app.post("/create", createTask)




app.listen(3333, () => {
    console.log("We're connected \n http://localhost:3333");
});