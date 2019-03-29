'use strict';
const mongoose=require('mongoose');

const Webhooks=require('../models/webhook').Webhooks;
const Users=require('../models/user').Users;
const Stocks=require('../models/stockData').Stocks;

const key='TA2O8Q047EBT10HI';

exports.addWebhook=(req,res)=>{
    let user_id=req.userData.userId;
    let scanningUrl=req.body.scanningUrl;
    let conditions=req.body.conditions;
    let returnUrl=req.body.returnUrl;
    let time_interval=req.body.time_interval;

    let webhookRecord=new Webhooks({
        _id: new mongoose.Types.ObjectId(),
        userId:user_id,
        scanning_url:scanningUrl,
        conditions:{
            parameter:conditions.parameter,
            difference:conditions.difference
        },
        returning_url:returnUrl,
        time_interval:time_interval,
        time:new Date()
    });

    webhookRecord.save((err,result)=>{
        if (err) {
            res.status(500).json({
                success: false,
                message: 'sorry! Weebhook can not be added. Please try again'
            });
        }else{
            res.status(200).json({
                success: true,
                message: 'Webhook successfully added'
            });
        }
    });



}

