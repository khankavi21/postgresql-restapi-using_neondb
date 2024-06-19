import postgres  from 'postgres';
import {config} from 'dotenv';
config();

const {PGHOST,PGDATABASE, PGUSER,PGPASSWORD ,ENDPOINT_ID} = process.env;

export const sql = postgres({
    host:PGHOST,
    database:PGDATABASE,
    username:PGUSER,
    password:PGPASSWORD,
    port:5432,
    ssl:'require',
    connection:{
        options:`project=${ENDPOINT_ID}`
    }
});

const createTableQuery = sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
`;

export const connectTODb = async()=>{
    try {
        await createTableQuery;
        console.log('Table users created successfully');
    } catch (error) {
        console.error('Error fetching PostgreSQL version:', error)
    }
}











