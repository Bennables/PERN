import express from 'express';
import { connect, getTasks, getUsers, new_refresh } from '../controllers/others.js';

const router = express.Router();

router.get("", connect)

router.get("/personal", getTasks)

router.get("/users", getUsers)


router.get("", new_refresh)

export default router;