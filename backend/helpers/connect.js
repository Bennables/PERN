import {Pool} from 'pg';

import {drizzle} from 'drizzle-orm/node-postgres';

const connection = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: 'postgres',
    database: 'squadwork',
    port: 5432
})

//drizzle expects an existing connection
const db = drizzle(connection);


export {connection, db};
