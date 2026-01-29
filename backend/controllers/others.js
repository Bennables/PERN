import connection from "../helpers/connect.js";
import { refreshTokens } from "../helpers/helpers.js";

const connect = async(req, res) => { 
    res.send("WE'RE CONNECTED");
}

const getTasks = async(req, res) =>{
    const user = req.user;

    const user_id = (await connection.query("SELECT ID FROM users where username=$1", [user])).rows[0].id;

    /// this needs to be changed 
    // SELECT * FROM tasks WHERE owner_id=$1 ORDER BY urgency, ind
    // select task_id from order where user_id = $1 ORDER BY ind;
    const tasks = (await connection.query("SELECT * FROM ordering INNER JOIN tasks ON tasks.ID = ordering.task_id WHERE ordering.user_id=$1 ORDER BY urgency, ind", [user_id])).rows
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
    // updates the order of tasks.
    try{
        const data = []

        const user_id = (await connection.query("SELECT ID FROM users WHERE username=$1", [req.user])).rows[0].id;
        // console.log(user_id);


        // console.log(user);
        console.log(req.body);

        

        let ind = 0
        // Check if there are tasks to update
        if (!req.body || req.body.length === 0) {
            console.log("No tasks to update");
            return res.status(400).send({"message": "No tasks provided for update"});
        }

        console.log("Updating tasks for user_id:", user_id);
        console.log("Tasks to update:", req.body.length);

        // First update urgency in tasks table
        let urgencyData = [];
        let urgencyInd = 0;
        let urgencyQueryStr = "UPDATE tasks SET urgency = CASE";

        for(let i = 0; i < req.body.length ; ++i){
            urgencyData.push(req.body[i].task_id)
            urgencyData.push(req.body[i].urgency)
            urgencyQueryStr += ` WHEN ID = $${++urgencyInd} THEN $${++urgencyInd}`
        }
        urgencyData.push(user_id) 
        urgencyQueryStr += ` ELSE urgency END WHERE owner_id = $${++urgencyInd};`

        // Then update ind in ordering table
        let orderingData = [];
        let orderingInd = 0;
        let orderingQueryStr = "UPDATE ordering SET ind = CASE";

        for(let i = 0; i < req.body.length ; ++i){
            orderingData.push(req.body[i].task_id)
            orderingData.push(req.body[i].index)
            orderingQueryStr += ` WHEN task_id = $${++orderingInd} THEN $${++orderingInd}`
        }
        orderingData.push(user_id) 
        orderingQueryStr += ` ELSE ind END WHERE user_id = $${++orderingInd};`

        console.log("Urgency query:", urgencyQueryStr);
        console.log("Ordering query:", orderingQueryStr);

        // Execute both queries
        await connection.query(urgencyQueryStr, urgencyData);
        await connection.query(orderingQueryStr, orderingData);
        // console.log(urgencyQueryStr)
        // console.log(urgencyData)
        // console.log(orderingQueryStr)
        // console.log(orderingData)

        res.status(200).send({"message" : "Tasks updated successfully"})
    }
    catch(e){
        console.log("Error updating tasks:", e)
        res.status(500).send({"message": "Failed to update tasks", "error": e.message})
    }
    
}

const updateTeamTasks = async (req, res) => {
    try {
        const user_id = (await connection.query(
            "SELECT ID FROM users WHERE username=$1",
            [req.user]
        )).rows[0].id;

        const org_result = await connection.query(
            "SELECT org_id FROM org_members WHERE user_id=$1",
            [user_id]
        );

        if (org_result.rows.length === 0) {
            return res.status(400).send({ "message": "User is not part of any organization" });
        }

        const org_id = org_result.rows[0].org_id;

        if (!req.body || req.body.length === 0) {
            console.log("No team tasks to update");
            return res.status(400).send({ "message": "No tasks provided for update" });
        }

        console.log("Updating team tasks for user_id:", user_id, "org_id:", org_id);
        console.log("Tasks to update:", req.body.length);

        // Update urgency for org tasks
        let urgencyData = [];
        let urgencyInd = 0;
        let urgencyQueryStr = "UPDATE tasks SET urgency = CASE";

        for (let i = 0; i < req.body.length; ++i) {
            urgencyData.push(req.body[i].task_id);
            urgencyData.push(req.body[i].urgency);
            urgencyQueryStr += ` WHEN ID = $${++urgencyInd} THEN $${++urgencyInd}`;
        }
        urgencyData.push(org_id);
        urgencyQueryStr += ` ELSE urgency END WHERE org_id = $${++urgencyInd};`;

        // Update ordering per user
        let orderingData = [];
        let orderingInd = 0;
        let orderingQueryStr = "UPDATE ordering SET ind = CASE";

        for (let i = 0; i < req.body.length; ++i) {
            orderingData.push(req.body[i].task_id);
            orderingData.push(req.body[i].index);
            orderingQueryStr += ` WHEN task_id = $${++orderingInd} THEN $${++orderingInd}`;
        }
        orderingData.push(user_id);
        orderingQueryStr += ` ELSE ind END WHERE user_id = $${++orderingInd};`;

        console.log("Team urgency query:", urgencyQueryStr);
        console.log("Team ordering query:", orderingQueryStr);

        await connection.query(urgencyQueryStr, urgencyData);
        await connection.query(orderingQueryStr, orderingData);

        res.status(200).send({ "message": "Team tasks updated successfully" });
    } catch (e) {
        console.log("Error updating team tasks:", e);
        res.status(500).send({ "message": "Failed to update team tasks", "error": e.message });
    }
};

export { connect, getTasks, getUsers, new_refresh, updateTasks, updateTeamTasks }