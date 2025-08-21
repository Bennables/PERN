CREATE TABLE tasks(
    task_id SERIAL PRIMARY KEY,
    owner_id INT NOT NULL REFERENCES users(id), 
    task_name VARCHAR(32),
    due_date DATE,
    urgency VARCHAR(16)
);


