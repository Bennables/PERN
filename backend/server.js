import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

// Import controllers
import { login, register } from './controllers/account.js';
import { connect, getTasks, getUsers, new_refresh, updateTasks } from './controllers/others.js';
import { verifyToken, getUserID } from './helpers/helpers.js';
import connection from './helpers/connect.js';

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

// ===== PROTECTED ROUTES (Authentication Required) =====
// Apply verifyToken middleware to all routes below
app.use(verifyToken);

app.get("/personal", connect);  // Test connection route
app.get("/personal/users", getUsers);  // Get all users (admin route?)



app.get("/tasks", getTasks)
app.put("/tasks", updateTasks)


const getTeamTasks = async(req, res) =>{
    const org_id = parseInt((await connection.query("SELECT org_id FROM users WHERE username=$1", [req.user])).rows[0].org_id);
    console.log(org_id)
    console.log("THE ORG ID IS: " + org_id);


    const teamTasks = await connection.query("SELECT * FROM tasks WHERE org_id = $1 ORDER BY urgency, ind", [org_id]);
    // console.log(teamTasks)

    res.status(200).send({"message": "success", "tasks": teamTasks.rows})
}

app.get("/team", getTeamTasks);


const createTask = async (req, res) =>{
    const scope = req.body.scope;
    const taskName = req.body.name;

    if (scope == "personal"){
        const id = getUserID(req.user);
        const result = await connection.query(
            "INSERT INTO tasks (owner_id, task_name, urgency, ind) VALUES ($1, $2, $3, $4) RETURNING *", 
            [user_id, taskName, 1, 0] // Default to low priority (1) and index 0
        );
    }
    else{
        const id = getUserOrgID(req.user);

        if (!org_id) {
            return res.status(400).send({"message": "User is not part of any organization"});
        }
        
        // Insert team task
        const result = await connection.query(
            "INSERT INTO tasks (task_name, urgency, ind, org_id) VALUES ($1, $2, $3, $4, $5) RETURNING *", 
            [ taskName, 1, 0,id] // Default to low priority (1) and index 0
        );
    }
    
    
}

app.post("/create", createTask)



app.listen(3333, () => {
    console.log("We're connected \n http://localhost:3333");
});