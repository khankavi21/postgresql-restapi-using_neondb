import express from 'express';
import { router } from 'express';

import User from '../models/user';

import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/user';

const jwtSecret = "thisisthe$temp#jsonwebtokensecret"

router.post('/createuser', [
    body('email').isEmail(),
    body('name').isLength({min:4}),
    body('password','Password length must have minimum 5 character').isLength({min:5}),
    body('phoneNumber','Phone Number lenght must have 10 character').isLength({min:10,max:10})]
, async (req, res) => {
    
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors : errors.array()});
    }

    const salt = await bcrypt.genSalt(10);
    let secPassword = await bcrypt.hash(req.body.Password,salt);
    
    try{
        await User.create({
            name : req.body.name,
            password : secPassword,
            email:req.body.email,
            phoneNumber:req.body.phoneNumber
        })
        res.json({success:true});
    }catch(error){
        console.log(error);
        res.json({success:false});
    }
})



const createUser = async (req, res) => {
    
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors : errors.array()});
    }

    const salt = await bcrypt.genSalt(10);
    let secPassword = await bcrypt.hash(req.body.Password,salt);
    
    try{
        await User.create({
            name : req.body.name,
            password : secPassword,
            email:req.body.email,
            phoneNumber:req.body.phoneNumber
        })
        res.json({success:true});
    }catch(error){
        console.log(error);
        res.json({success:false});
    }
};



