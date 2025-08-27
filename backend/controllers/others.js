import connection from "../helpers/connect.js";
import { refreshTokens } from "../helpers/helpers.js";

const connect = async(req, res) => { 
    res.send("WE'RE CONNECTED");
}

const getTasks = async(req, res) =>{
    const user = req.user;

    const user_id = (await connection.query("SELECT id FROM users where username=$1", [user])).rows[0].id;
    const tasks = (await connection.query("SELECT * FROM tasks WHERE owner_id=$1", [user_id])).rows
    console.log(tasks);


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



export { connect, getTasks, getUsers, new_refresh}