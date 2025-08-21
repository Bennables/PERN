import express from 'express'
import connection from './connect.js';
import cors from 'cors';

import argon2, { hash } from 'argon2';
import dotenv from 'dotenv';

import jwt from 'jsonwebtoken';


const app = express();

app.use(express.json());
app.use(cors());
dotenv.config();

const createToken = (user) =>{
    const token = jwt.sign({user: user}, process.env.JWT_SECRET_KEY, {expiresIn: "1h"});
    // console.log("The JWT is: " + token)
    return token;
}



app.get('/users', async  (req, res) =>{
    console.log(req.body);
    const data = await connection.query("SELECT * FROM users;")
    console.log(data.rows);
    res.status(200).send("we're good. don't worry")
})


app.post("/login", async(req, res) =>{

    console.log("We have received data");
    console.log(req.body);
    const password = req.body.password;
    const username = req.body.username;

    const hashed_password = (await connection.query("SELECT * FROM users WHERE username=$1;", [username])).rows[0].pwhashed;
    // console.log(hashed_password);

    const verified = await  argon2.verify(hashed_password, password, {secret: Buffer.from(process.env.SECRET_PEPPER)})
    console.log("THE PASS IS " + (verified ? "correct" : "incorrect"))


    if (verified){
        res.status(200).send({"message": "correct", "token": createToken(username)});
    }
   
})

app.post("/register", async (req,res) =>{
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
})



app.get("", async(req, res) => { 
    res.send("WE'RE CONNECTED");
})






app.listen(3333, ()=>(
    console.log("We're connected \n http://localhost:3333")
));
