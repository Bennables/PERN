import jwt from 'jsonwebtoken';
import redisClient from "./redis.js"
import connection from './connect.js';
import {v4 as uuidv4} from 'uuid';

const createToken = async (user) =>{
    console.log('running create token')
    const jwtid = uuidv4();
    const token = jwt.sign({user: user, jwtid: jwtid}, process.env.JWT_SECRET_KEY, {expiresIn: "1h"});

    console.log(token);
    // console.log("The JWT is: " + token)
    await redisClient.set(jwtid, token);

    return token;
}


const verifyToken = async (req, res, next) => {
    console.log('verifying token');
    const token = req.headers['authorization'].split(' ')[1]
    // console.log(token)

    try{
        const jwtVerified = jwt.verify(token, process.env.JWT_SECRET_KEY);
        /* the format of jwtverified is a json
        {
            user: 'ben',
            jwtid: 'd6b114fc-6e45-4ebd-bd53-7ccb85ff9493',
            iat: 1755888544,
            exp: 1755892144
        } 
        */
        const token_from_redis = await redisClient.get(jwtVerified.jwtid)
        req.user = jwtVerified.user;

        console.log('token from redis is. ' + token_from_redis)

        // console.log(jwtVerified);
        // console.log(jwtVerified.user);
        next();
    }       
    catch{
        return res.status(400).send({"message": "bad token"});
    }
}


export {createToken, verifyToken};