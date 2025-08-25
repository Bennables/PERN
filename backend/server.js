import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import accountRoutes from './routes/account.js';
import otherRoutes from './routes/others.js';
import { verifyToken } from './helpers/helpers.js';
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

const new_refresh = (req, res) =>{

    console.log(req.cookies)
    res.status(200).json({ message: "refresh endpoint hit" });
}
app.use("/auth/refresh", new_refresh)


app.listen(3333, ()=>(
    console.log("We're connected \n http://localhost:3333")
));
