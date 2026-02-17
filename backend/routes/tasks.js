import { Router } from 'express';
import { getTasks, getTaskById, updateTasks, getTeamTasks, updateTeamTasks, createTask } from '../controllers/tasks.js';
import { createSubtask, updateSubtask, getSubtasks, deleteSubtask } from '../controllers/subtasks.js';
import { verifyToken } from '../helpers/helpers.js';

const router = Router();

// All task routes require authentication
router.use(verifyToken);

router.get("/tasks", getTasks);
router.get("/tasks/:id", getTaskById);
router.put("/tasks", updateTasks);

router.get("/team", getTeamTasks);
router.put("/team/tasks", updateTeamTasks);

router.post("/create", createTask);

// Subtask routes
router.post("/subtasks", createSubtask);
router.put("/subtasks/:id", updateSubtask);
router.get("/tasks/:task_id/subtasks", getSubtasks);
router.delete("/subtasks/:id", deleteSubtask);

export default router;
