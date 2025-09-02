CREATE TABLE tasks(
    task_id SERIAL PRIMARY KEY,
    owner_id INT,
    task_name VARCHAR(32),
    deadline DATE,
    urgency INT CHECK(urgency < 4),
    org_id INT, --to be done later,
    ind int default -1
);



-- Insert sample tasks for owner_id = 1 following your schema
INSERT INTO tasks (owner_id, task_name, deadline, urgency, org_id, ind) VALUES
-- Low Priority Tasks (urgency = 1)
(1, 'Review weekly reports', '2024-12-20', 1, 2, -1),
(1, 'Update documentation', '2024-12-22', 1, 2, -1),
(1, 'Schedule team meeting', '2024-12-18', 1, 2, -1),
(1, 'Clean up email inbox', '2024-12-25', 1, 1, -1),
(1, 'Research new tech', '2024-12-30', 1, 1, -1),
(1, 'Organize workspace', '2024-12-21', 1, 1, -1),
(1, 'Update profile', '2024-12-28', 1, 1, -1),
(1, 'Read industry articles', '2024-12-26', 1, 1, -1),

-- High Priority Tasks (urgency = 2)  
(1, 'Fix critical bug', '2024-12-16', 2, 1, -1),
(1, 'Client presentation', '2024-12-17', 2, 1, -1),
(1, 'Deploy security patches', '2024-12-18', 2, 1, -1),
(1, 'Review pull requests', '2024-12-16', 2, 1, -1),
(1, 'Budget proposal', '2024-12-19', 2, 1, -1),
(1, 'Database migration', '2024-12-17', 2, 1, -1),
(1, 'Performance testing', '2024-12-20', 2, 1, -1),

-- Any Priority Tasks (urgency = 3)
(1, 'Plan vacation', '2025-01-15', 3, 2, -1),
(1, 'Backup files', '2024-12-31', 3, 2, -1),
(1, 'Network with colleagues', '2024-12-30', 3, 2, -1),
(1, 'Learn new language', '2025-01-30', 3, 2, -1),
(1, 'Attend conference', '2025-02-15', 3, 2, -1),
(1, 'Update skills', '2025-01-20', 3, 2, -1),

-- Tasks with 2 urgency (will be handled by your frontend logic)
(1, 'Unassigned task 1', '2024-12-25', 2, 2, -1),
(1, 'Unassigned task 2', '2024-12-27', 2, 2, -1),
(1, 'Unassigned task 3', '2024-12-29', 2, 2, -1);