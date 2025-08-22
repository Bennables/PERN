import { createToken,verifyToken } from "../helpers/helpers.js";
import connection from "../helpers/connect.js";
import argon2 from 'argon2';


const login = async(req, res) =>{

    console.log("We have received data");
    console.log(req.body);
    const password = req.body.password;
    const username = req.body.username;

    const hashed_password = (await connection.query("SELECT * FROM users WHERE username=$1;", [username])).rows[0].pwhashed;
    // console.log(hashed_password);

    const verified = await  argon2.verify(hashed_password, password, {secret: Buffer.from(process.env.SECRET_PEPPER)})
    console.log("THE PASS IS " + (verified ? "correct" : "incorrect"))


    if (verified){
        const token = await createToken(username)
        res.status(200).send({"message": "correct", "token": token});
        // console.log("TOKEN is" + token);
    }
   
}

const register = async (req,res) =>{
    console.log("NEW REGISTRATION");
    console.log(req.body);
    const username = req.body.username;
    const password = req.body.password;
    console.log(username, password);

    //check for existing username
    const existing = await connection.query("SELECT * FROM users WHERE username=$1", [username])
    if (existing.rows.length > 0){
        console.log("DUPLICATE USERNAME")
        res.status(400).send("THis username already exists")
        return;
    }

    const hash = await argon2.hash(password, {secret: Buffer.from(process.env.SECRET_PEPPER), type: argon2.argon2id})
    const psql_response = await connection.query(`INSERT INTO users (username, pwHashed) VALUES ($1, $2);`, [username, hash]);
    res.status(200).send("created")
}


export {login, register}

