import express from 'express';
const app = express();

import bodyParser from 'body-parser';
import userRoutes from './routes/users.js';

import { connectTODb  } from './db.js';


import { config } from 'dotenv';
config();
const PORT = process.env.PORT||5000;

app.use(bodyParser.json());

app.use('/users',userRoutes);

app.get('/',(req,res)=>{
  console.log("[hello!]");
  res.send("hello from homepage");
})

app.listen(PORT ,()=>{
    console.log(`Server is running on Port : http://localhost:${PORT}`);
})

connectTODb();
