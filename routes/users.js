const express = require('express');
const router = express.Router();

const Users= require('../controllers/user');

// routes dealing with user collection
//routes for authentication
router.post('/register',Users.register);
router.delete('/delete/:id',Users.deleteuser);
router.post('/login',Users.login);


module.exports = router;
