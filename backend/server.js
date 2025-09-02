import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

// Import controllers
import { login, register } from './controllers/account.js';
import { connect, getTasks, getUsers, new_refresh } from './controllers/others.js';
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

//! adfsfasdfsdafdslkfjds;lkfj;dslkgfjafk;gjf;lkgjf;lkgj;flgjlkfdg
//! WORKING HERE    lkdjlk;d;fjfd;kjfsad;d;lajkfjad;fk

app.get("/tasks", getTasks)

const update = async(req, res) => {
    try{
        const data = []

        const user_id = (await connection.query("SELECT ID FROM users WHERE username=$1", [req.user])).rows[0].id;
        // console.log(user_id);


        // console.log(user);
        console.log(req.body);

        

        let ind = 0


        // console.log(info);
        let queryStr = "UPDATE tasks SET urgency = CASE";

        for(let i = 0; i < req.body.length ; ++i){
            data.push(req.body[i].task_id)
            data.push(req.body[i].urgency)
            queryStr += ` WHEN task_id = $${++ind} THEN $${++ind}`
        }
        queryStr += " ELSE urgency END, ind = CASE"
        for(let i = 0; i < req.body.length ; ++i){
            data.push(req.body[i].task_id)
            data.push(req.body[i].index)
            queryStr += ` WHEN task_id = $${++ind} THEN $${++ind}`

        }
        data.push(user_id) 
        queryStr += ` ELSE ind END WHERE owner_id = $${++ind};`


        const resut = await connection.query(queryStr, data)
        console.log(resut)

        console.log(queryStr)
        console.log(data)

        res.status(200).send({"message" : "YEAHH"})
    }
    catch(e){
        console.log(e)
    }
    
}


app.put("/tasks", update)

app.listen(3333, () => {
    console.log("We're connected \n http://localhost:3333");
});