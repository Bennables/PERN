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

export { connect, getTasks, getUsers}