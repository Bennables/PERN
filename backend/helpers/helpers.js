import jwt from 'jsonwebtoken';


const createToken = (user) =>{
    const token = jwt.sign({user: user}, process.env.JWT_SECRET_KEY, {expiresIn: "1h"});
    // console.log("The JWT is: " + token)
    return token;
}


const verifyToken = (req, res, next) => {

    const token = req.headers['authorization'].split(' ')[1]
    // console.log(token)

    try{
        const jwtVerified = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = jwtVerified.user;

        // console.log(jwtVerified);
        // console.log(jwtVerified.user);
        next();
    }
    catch{
        return res.status(400).send({"message": "bad token"});
    }
}


export {createToken, verifyToken};