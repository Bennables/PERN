import connection from "../helpers/connect.js";
import { getUserID } from "../helpers/helpers.js";

// Create a new subtask for a task
const createSubtask = async (req, res) => {
    try {
        const { task_id, description } = req.body;

        if (!task_id) {
            return res.status(400).send({ error: true, message: "task_id is required" });
        }

        // Verify the task exists and user has access to it
        const user_id = (await connection.query("SELECT id FROM users WHERE username=$1", [req.user])).rows[0]?.id;

        if (!user_id) {
            return res.status(404).send({ error: true, message: "User not found" });
        }

        // Check if user has access to this task (either owns it or is in the org)
        const taskCheck = await connection.query(
            `SELECT t.id, t.owner_id, t.org_id 
             FROM tasks t 
             LEFT JOIN org_members om ON t.org_id = om.org_id 
             WHERE t.id = $1 AND (t.owner_id = $2 OR om.user_id = $2)`,
            [task_id, user_id]
        );

        if (taskCheck.rows.length === 0) {
            return res.status(403).send({ error: true, message: "Access denied or task not found" });
        }

        // Create the subtask
        const result = await connection.query(
            "INSERT INTO subtask (task_id, description) VALUES ($1, $2) RETURNING *",
            [task_id, description || null]
        );

        res.status(201).send({ 
            error: false, 
            message: "Subtask created successfully", 
            subtask: result.rows[0] 
        });
    } catch (error) {
        console.log("Error creating subtask:", error);
        res.status(500).send({ error: true, message: "Failed to create subtask" });
    }
};

// Update an existing subtask
const updateSubtask = async (req, res) => {
    try {
        const { id } = req.params;
        const { description } = req.body;

        if (!id) {
            return res.status(400).send({ error: true, message: "Subtask ID is required" });
        }

        // Get user_id
        const user_id = (await connection.query("SELECT id FROM users WHERE username=$1", [req.user])).rows[0]?.id;

        if (!user_id) {
            return res.status(404).send({ error: true, message: "User not found" });
        }

        // Verify user has access to the task that owns this subtask
        const accessCheck = await connection.query(
            `SELECT st.id 
             FROM subtask st
             JOIN tasks t ON st.task_id = t.id
             LEFT JOIN org_members om ON t.org_id = om.org_id
             WHERE st.id = $1 AND (t.owner_id = $2 OR om.user_id = $2)`,
            [id, user_id]
        );

        if (accessCheck.rows.length === 0) {
            return res.status(403).send({ error: true, message: "Access denied or subtask not found" });
        }

        // Update the subtask
        const result = await connection.query(
            "UPDATE subtask SET description = $1 WHERE id = $2 RETURNING *",
            [description || null, id]
        );

        res.status(200).send({ 
            error: false, 
            message: "Subtask updated successfully", 
            subtask: result.rows[0] 
        });
    } catch (error) {
        console.log("Error updating subtask:", error);
        res.status(500).send({ error: true, message: "Failed to update subtask" });
    }
};

// Get all subtasks for a specific task
const getSubtasks = async (req, res) => {
    try {
        const { task_id } = req.params;

        if (!task_id) {
            return res.status(400).send({ error: true, message: "task_id is required" });
        }

        // Get user_id
        const user_id = (await connection.query("SELECT id FROM users WHERE username=$1", [req.user])).rows[0]?.id;

        if (!user_id) {
            return res.status(404).send({ error: true, message: "User not found" });
        }

        // Verify user has access to this task
        const taskCheck = await connection.query(
            `SELECT t.id 
             FROM tasks t 
             LEFT JOIN org_members om ON t.org_id = om.org_id 
             WHERE t.id = $1 AND (t.owner_id = $2 OR om.user_id = $2)`,
            [task_id, user_id]
        );

        if (taskCheck.rows.length === 0) {
            return res.status(403).send({ error: true, message: "Access denied or task not found" });
        }

        // Get all subtasks for this task
        const subtasks = await connection.query(
            "SELECT * FROM subtask WHERE task_id = $1 ORDER BY id",
            [task_id]
        );

        res.status(200).send({ 
            error: false, 
            message: "success", 
            subtasks: subtasks.rows 
        });
    } catch (error) {
        console.log("Error fetching subtasks:", error);
        res.status(500).send({ error: true, message: "Failed to fetch subtasks" });
    }
};

// Delete a subtask
const deleteSubtask = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).send({ error: true, message: "Subtask ID is required" });
        }

        // Get user_id
        const user_id = (await connection.query("SELECT id FROM users WHERE username=$1", [req.user])).rows[0]?.id;

        if (!user_id) {
            return res.status(404).send({ error: true, message: "User not found" });
        }

        // Verify user has access to the task that owns this subtask
        const accessCheck = await connection.query(
            `SELECT st.id 
             FROM subtask st
             JOIN tasks t ON st.task_id = t.id
             LEFT JOIN org_members om ON t.org_id = om.org_id
             WHERE st.id = $1 AND (t.owner_id = $2 OR om.user_id = $2)`,
            [id, user_id]
        );

        if (accessCheck.rows.length === 0) {
            return res.status(403).send({ error: true, message: "Access denied or subtask not found" });
        }

        // Delete the subtask
        await connection.query("DELETE FROM subtask WHERE id = $1", [id]);

        res.status(200).send({ 
            error: false, 
            message: "Subtask deleted successfully" 
        });
    } catch (error) {
        console.log("Error deleting subtask:", error);
        res.status(500).send({ error: true, message: "Failed to delete subtask" });
    }
};

export { createSubtask, updateSubtask, getSubtasks, deleteSubtask };
