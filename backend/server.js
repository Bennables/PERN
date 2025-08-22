import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import accountRoutes from './routes/account.js';
import otherRoutes from './routes/others.js';
import { verifyToken } from './helpers/helpers.js';

const app = express();

app.use(express.json());
app.use(cors());
dotenv.config();

app.use("", accountRoutes);
app.use("/personal", verifyToken)
app.use("/personal", otherRoutes);


app.listen(3333, ()=>(
    console.log("We're connected \n http://localhost:3333")
));
