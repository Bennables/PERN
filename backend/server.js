import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

// Import controllers
import { login, register } from './controllers/account.js';
import { connect, getTasks, getUsers, new_refresh, updateTasks } from './controllers/others.js';
import { verifyToken } from './helpers/helpers.js';
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



app.listen(3333, () => {
    console.log("We're connected \n http://localhost:3333");
});