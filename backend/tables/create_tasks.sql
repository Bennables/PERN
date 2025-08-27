CREATE TABLE tasks(
    task_id SERIAL PRIMARY KEY,
    owner_id INT NOT NULL REFERENCES users(id), 
    task_name VARCHAR(32),
    deadline DATE,
    urgency INT CHECK(urgency < 4),
    org_id INT, --to be done later,
    ind int default -1
);


