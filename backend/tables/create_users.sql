CREATE TABLE users(
    ID SERIAL PRIMARY KEY ,
    username VARCHAR(32) UNIQUE,
    pwHashed VARCHAR(128)
);

INSERT INTO users (
    username
) VALUES (
    'bean'
);



INSERT INTO users (
    username
) VALUES (
    'two'
);