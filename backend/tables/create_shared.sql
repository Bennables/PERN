CREATE TABLE shared_tasks(
    task_id SERIAL PRIMARY KEY,
    owner_id INT,
    task_name VARCHAR(32),
    due_date DATE,
    urgency VARCHAR(16)
);

CREATE TABLE organization(
    org_id SERIAL PRIMARY KEY,
    ppl_ids INT[],
)
