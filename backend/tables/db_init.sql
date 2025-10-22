    CREATE TABLE users(
        ID SERIAL PRIMARY KEY ,
        username VARCHAR(32) UNIQUE,
        pwHashed VARCHAR(128),
        lvl int,
        currXp int
    );

    CREATE TABLE org(
        ID SERIAL PRIMARY KEY,
        name VARCHAR(32) UNIQUE
    );

    CREATE TABLE org_members(
        org_id INT REFERENCES org(ID) ON DELETE CASCADE,
        user_id INT REFERENCES users(ID) ON DELETE CASCADE,
        PRIMARY KEY (org_id, user_id)
    );
    -- the idea for this is that each task will have a unique id
    -- only if you are the owner or part of the owner org will you be
    -- able to access it.
    -- each person will  ahave their own ordering of it.

    CREATE TABLE tasks (
        ID SERIAL PRIMARY KEY,
        owner_id INT REFERENCES users(ID),
        org_id INT REFERENCES org(ID),
        task_name VARCHAR(32),
        deadline DATE,
        urgency INT CHECK (urgency BETWEEN 0 AND 3),
        CHECK ((owner_id IS NOT NULL) OR (org_id IS NOT NULL))
    );

    CREATE TABLE ordering (
        user_id INT REFERENCES users(ID) ON DELETE CASCADE,
        task_id INT REFERENCES tasks(ID) ON DELETE CASCADE,
        ind INT,
        PRIMARY KEY (user_id, task_id)
    );

    CREATE TABLE levels(
        lvl int,
        lvlXP int
    );

    INSERT INTO levels (lvl, lvlXP) VALUES
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


