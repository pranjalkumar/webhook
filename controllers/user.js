'use strict';
const mongoose=require('mongoose');

const Users=require('../models/user').Users;
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');

//making api key for each user to help them validate the return request
//random string generation
function makeid(length) {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

//registering new user
exports.register= (req,res)=> {
    //checking if user already exists or not
    Users.find({email: req.body.email},(err,data)=>{
        if(data.length>=1){
            return res.status(409).json({
                success:false,
                message: 'user already exists'
            });
        }else{
            // creating the hash of the password
            bcrypt.hash(req.body.password, 10, (err, hash)=> {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: 'sorry! something happened, please try again'
                    });
                } else {
                    //creating a new user
                    let user = new Users({
                        _id: new mongoose.Types.ObjectId(),
                        email: req.body.email,
                        password: hash,
                        api_key:makeid(20)

                    });
                    user.save((err, result)=> {
                        if (err) {
                            res.status(500).json({
                                success: false,
                                message: 'sorry! something happened, please try again'
                            });
                        }else{
                            res.status(200).json({
                                success: true,
                                message: 'sucessfully registered'
                            });
                        }
                    });
                }
            });
        }
    });

};

//deleting the user with the help of userid
//for testing purpose
exports.deleteuser= (req,res)=> {
    let id=req.params.id;
    Users.remove({_id:id},(err,result)=> {
        if(err){
            res.status(500).json({
                sucess:false,
                message: 'invalid user'
            });
        }else{
            res.status(200).json({
                success:true,
                message: 'user deleted'
            });

        }
    });
};

//login function
exports.login= (req,res)=> {
    Users.find({email: req.body.email},(err,data)=> {
       if(data.length<1 || err){
           return res.status(401).json({
               success: false,
               message: 'invalid user'
           });
       }else{
           //comparing both the passwords
           bcrypt.compare(req.body.password,data[0].password,(err,result)=> {
               if(err){
                   return res.status(401).json({
                       success: false,
                       message: 'invalid user'
                   });
               }
               if(result){
                   //generating a JWT token users users email and userid
                   let token= jwt.sign({
                      email: data[0].email,
                       userId: data[0]._id
                   },
                       'secret',
                       {expiresIn:"1h"}
                       );
                   return res.status(200).json({
                       success: 'successfully logged in',
                       token: token
                   });
               }else {
                   return res.status(401).json({
                       success: false,
                       message: 'invalid user'
                   });
               }
           });
       }
    });
};