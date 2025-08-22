import express from 'express';
import { login, register } from '../controllers/account.js';

const router = express.Router();

router.post("/login", login)
router.post("/register", register)
// router.post("", login)



export default router