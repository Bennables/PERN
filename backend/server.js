import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import accountRoutes from './routes/account.js';
import otherRoutes from './routes/others.js';
import { refreshTokens, verifyToken } from './helpers/helpers.js';
import cookieParser from 'cookie-parser';

const app = express();


dotenv.config();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173', // Vite default port
    credentials: true
}));
app.use(cookieParser())


app.use("", accountRoutes);
app.use("/personal", verifyToken)
app.use("/personal", otherRoutes);

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
app.get("/auth/refresh", new_refresh)

const clearCookies = (req, res) => {
    res.clearCookie();
    res.status(200).send({"message": "cookies have been cleared"})
}

app.get("/clear", clearCookies)


app.listen(3333, ()=>(
    console.log("We're connected \n http://localhost:3333")
));
