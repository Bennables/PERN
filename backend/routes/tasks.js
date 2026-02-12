import { Router } from 'express';
import { getTasks, updateTasks, getTeamTasks, updateTeamTasks, createTask } from '../controllers/tasks.js';
import { verifyToken } from '../helpers/helpers.js';

const router = Router();

// All task routes require authentication
router.use(verifyToken);

router.get("/tasks", getTasks);
router.put("/tasks", updateTasks);

router.get("/team", getTeamTasks);
router.put("/team/tasks", updateTeamTasks);

router.post("/create", createTask);

export default router;
