import express from 'express';
import { connect, getTasks, getUsers } from '../controllers/others';

const router = express.Router();

router.get("", connect)

router.get("/personal", getTasks)

router.get("/users", getUsers)

export default router;