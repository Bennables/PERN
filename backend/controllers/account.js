import { createToken } from "../helpers/helpers.js";
import { prisma } from "../lib/prisma.js";
import argon2 from 'argon2';
import Cookies from 'js-cookie';



const login = async(req, res) =>{

    console.log("running login")
    const password = req.body.password;
    const username = req.body.username;

    const user = await prisma.users.findUnique({
        where: { username }
    });

    if (!user) {
        return res.status(400).send({"message": "User not found"});
    }

    const verified = await argon2.verify(user.pwHashed, password, {secret: Buffer.from(process.env.SECRET_PEPPER)})
    console.log("THE PASS IS " + (verified ? "correct" : "incorrect"))


    if (verified){
        const tokens = await createToken(username);
        console.log("THE TOKESN ARE HERE")
        res.cookie("refreshToken", tokens[1], {sameSite: 'lax', httpOnly: true})
        res.status(200).send({"message": "correct", "token": tokens[0]});
        console.log(tokens);
    }
   
}

const register = async (req,res) =>{
    console.log("NEW REGISTRATION");
    console.log(req.body);
    const username = req.body.username;
    const password = req.body.password.toString();

    //check for existing username
    const existing = await prisma.users.findUnique({
        where: { username }
    });
    
    if (existing){
        console.log("DUPLICATE USERNAME")
        res.status(400).send("THis username already exists")
        return;
    }

    const hash = await argon2.hash(password, {secret: Buffer.from(process.env.SECRET_PEPPER), type: argon2.argon2id})
    await prisma.users.create({
        data: {
            username,
            pwHashed: hash,
            lvl: 1,
            currXp: 0
        }
    });
    res.status(200).send("created")
}


export {login, register}

