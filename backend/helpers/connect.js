import {Pool} from 'pg';

const connection = new Pool({
    host: 'localhost',
    user: 'postgres',
    database: "pern",
    port: 5432
})



export default connection;
