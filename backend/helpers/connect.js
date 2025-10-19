import {Pool} from 'pg';

const connection = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: 'postgres',
    database: 'postgres',
    port: 5432
})



export default connection;
