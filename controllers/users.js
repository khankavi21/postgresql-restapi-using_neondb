import {v4 as uuid} from 'uuid';
import {sql} from '../db.js' 
import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import { config } from 'dotenv';
config();

const jwtSecret = process.env.JWT_SECRET;

let users = []

export const getUsers = async(req,res)=>{
    try {
        const query = sql`SELECT id,name,email,created_at FROM users`;

        const users = await query;
        console.log(`Users in the database:`,users);
        res.json(users);   
    } catch (error) {
        console.error('Error fetching users:',error);
        res.status(500).json({error:'Internal server error'});
    }
}

export const createUser = async (req,res)=>{
    
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors : errors.array()});
    }

    const  {name,email,password} = req.body;

    const salt = await bcrypt.genSalt(10);
    let secPassword = await bcrypt.hash(req.body.password,salt);
   
    try { 
        const insertQuery = sql`
        INSERT INTO users (name ,email,password)
        VALUES (${name} , ${email} ,${secPassword})
        RETURNING id,name,email,created_at;
        `;

        const result = await insertQuery;
        const newUser = result[0];

        res.status(201).json({success :true ,user:newUser});
    } catch (error) {
        console.error('Error creating user:',error);

        if(error.code === '23505'){
            res.status(409).json({success: false, error: 'Email already exists'});
        }
        else{
            res.status(500).json({success:false ,error:'Internal server error' });
        }
    }
};

export const loginUser = async (req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()});
    }
    
    const{email,password} = req.body;

    try{
        const result = await sql`SELECT * FROM users WHERE email = ${email}`;
        const userData = result[0];
        
        if(!userData){
            return res.status(400).json({errors : "Try logging in with correct credentials"});
        }

        const pwdCompare = await bcrypt.compare(password,userData.password)
        if(!pwdCompare){
            return res.status(400).json({errors:"Try logging in with correct credentials"});
        }
        
        const data = {
            user:{
                id:userData.id
            }
        }

        const authToken = jwt.sign(data,jwtSecret);
        return res.json({success:true,authToken});

    }
    catch(error){
        console.error('Error logging in:', error);
        res.status(500).json({success:false,error : 'Internal server error'});
    }
}

export const getUser = (req,res)=>{
    const {id} = req.params;

    const findUser = users.find((user)=> user.id === id);

    res.send(findUser);
}

export const deleteUser = (req,res)=>{
    const {id} = req.params;

    users = users.filter((user)=>user.id !== id);

    res.send(`User with the id ${id} deleted from the database`)
}

export const updateUser = (req,res)=>{
    const {id} = req.params;
    const {firstName,lastName,age} = req.body;

    const findUser = users.find((user)=> user.id === id);

    if(firstName){
        findUser.firstName = firstName;
    }
    if(lastName){
        findUser.lastName = lastName;
    }
    if(age){
        findUser.age = age;
    }
    
    res.send(`User with the id ${id} updated from the database`); 
    
}




