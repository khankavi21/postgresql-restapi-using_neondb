import express from 'express';
import {body} from 'express-validator';
 
import {createUser,getUsers,loginUser,getUser,deleteUser, updateUser} from '../controllers/users.js';

const router = express.Router();

router.get('/getUsers', getUsers);

router.post('/createUser',[
    body('name').isLength({min : 5}),
    body('email').isEmail(),
    body('password','Password length must have minimum 5 character').isLength({min:5}),
],createUser);

router.post('/loginUser',[
    body('email').isEmail(),
    body('password','Incorrect Password').isLength({min:5})
],loginUser);

router.get('/:id',getUser);

router.delete('/:id',deleteUser);

router.patch('/:id',updateUser);

export default router;
