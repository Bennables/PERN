import {Pool} from 'pg';

const connection = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: 'password',
    database: 'squadwork',
    port: 5432
})



export default connection;
