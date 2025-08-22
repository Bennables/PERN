import express from 'express'
import connection from './helpers/connect.js';
import cors from 'cors';

import argon2, { hash } from 'argon2';
import dotenv from 'dotenv';

import jwt from 'jsonwebtoken';
import { verifyToken } from './helpers/helpers.js';



const app = express();

app.use(express.json());
app.use(cors());
dotenv.config();

app.use("/login", )


app.use("/personal", verifyToken);


app.listen(3333, ()=>(
    console.log("We're connected \n http://localhost:3333")
));
