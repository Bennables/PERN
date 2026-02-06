-- USERS
INSERT INTO users ("username", "pwHashed", "lvl", "currXp") VALUES
('a', 'a', 1, 1),
('b', 'a', 1, 1),
('c', 'a', 1, 1);

-- ORGS
INSERT INTO org ("name") VALUES
('a'),
('b');

-- ORG MEMBERS
INSERT INTO org_members ("org_id", "user_id") VALUES
(1, 1),
(1, 2),
(2, 3);

-- TASKS
INSERT INTO tasks ("owner_id", "org_id", "task_name", "deadline", "urgency") VALUES
(1, NULL, 'a', '2026-01-01', 1),
(NULL, 1, 'a', '2026-01-01', 1),
(NULL, 2, 'a', '2026-01-01', 1);

-- ORDERING
INSERT INTO ordering ("user_id", "task_id", "ind") VALUES
(1, 1, 1),
(1, 2, 2),
(2, 2, 1),
(3, 3, 1);

-- LEVELS
INSERT INTO levels ("lvl", "lvlXP") VALUES
(1, 10),
(2, 20),
(3, 35),
(4, 55),
(5, 85),
(6, 120),
(7, 160),
(8, 200),
(9, 250),
(10, 320),
(11, 380),
(12, 500);
