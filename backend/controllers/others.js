import connection from "../helpers/connect.js";
import { refreshTokens } from "../helpers/helpers.js";

const connect = async(req, res) => { 
    res.send("WE'RE CONNECTED");
}

const getTasks = async(req, res) =>{
    const user = req.user;

    const user_id = (await connection.query("SELECT id FROM users where username=$1", [user])).rows[0].id;
    const tasks = (await connection.query("SELECT * FROM tasks WHERE owner_id=$1 ORDER BY urgency, ind", [user_id])).rows
    // console.log(tasks);

    res.status(200).send({"message": "success", "tasks": tasks})
}

const getUsers = async  (req, res) =>{
    console.log(req.body);
    const data = await connection.query("SELECT * FROM users;")
    console.log(data.rows);
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


        const result = await connection.query(queryStr, data);
        // console.log(result)

        // console.log(queryStr)
        // console.log(data)

        res.status(200).send({"message" : "Tasks updated successfully"})
    }
    catch(e){
        console.log("Error updating tasks:", e)
        res.status(500).send({"message": "Failed to update tasks", "error": e.message})
    }
    
}


export { connect, getTasks, getUsers, new_refresh, updateTasks }