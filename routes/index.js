const express = require('express');
const router = express.Router();

const Users= require('../controllers/user');
const Webhook=require('../controllers/webhook');
const checkAuth=require('../middlewares/check-auth');

// routes dealing with user collection
//routes to add the webhook
router.post('/addwebhook',checkAuth,Webhook.addWebhook);


module.exports = router;
