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

export const getUser = async(req,res)=>{
    const {id} = req.params;

    try {
        const result = await sql`SELECT id,name,email,created_at FROM users WHERE id = ${id}`
        
        if(result.length === 0){
            return res.status(404).json({success:false,message : "User not found"})
        }
        
        const user = result[0];

        res.status(200).json({success:true,user});
    } catch (error) {
       console.error('Error fetching user:',error);
       res.status(500).json({success :false,message:"Internal server error"}); 
    }
}

export const deleteUser = async (req,res)=>{
    const {id} = req.params;

    try {
        const result = await sql`DELETE FROM users WHERE id =${id} RETURNING *`;

        if(result.length === 0){
           return res.status(404).json({success : false , message:'User not found'});
        }
        
        res.status(200).json({success:true,message :'User deleted successfully',user:result[0]});
    } catch (error) {
        console.error('Error deleting user:',error);
        res.status(500).json({success:false,message:'Internal server error'});        
    }
}

export const updateUser = async (req,res)=>{
    const {id} = req.params;
    const {name,email,password} = req.body;

    try {
        if(!name && !email && !password){
            return res.status(400).json({success:false,message:'No fields to update'});
        }

        const fields = {}
        if (name) {
           fields.name = name;
        }
        if (email) {
            fields.email = email;
        }
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            fields.password = hashedPassword;
        }

        const result = await sql`
            UPDATE users
            SET name=${fields.name},
                email=${fields.email},
                password=${fields.password}
            WHERE id = ${id}
            RETURNING id, name, email, created_at;
        `;

        if (result.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const updatedUser = result[0];
        res.status(200).json({ success: true, user: updatedUser });
        
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    } 
}




