'use strict';
const mongoose=require('mongoose');

const Webhooks=require('../models/webhook').Webhooks;
const Users=require('../models/user').Users;
const schedule = require('node-schedule');
const Request = require("request");

const key='TA2O8Q047EBT10HI';

let schedules = {};

exports.addWebhook=(req,res)=>{
    let user_id=req.userData.userId;
    let scanningUrl=req.body.scanningUrl;
    let conditions=req.body.conditions;
    let returnUrl=req.body.returningUrl;
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

            schedules[user_id] = schedule.scheduleJob('*/'+time_interval+' * * * *', function(){
                // console.log(user_id);
                getData(user_id);

            });

        }
    });



}

function getData(user_id) {
    let url="https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=MSFT&interval=1min&apikey="+key;
    let data=Request.get(url,(err,response,body)=>{
        if(err){
            console.log('error fetching data from the remote server');
        }
        let stock_record=JSON.parse(body);

        // console.log(stock_record);
        // console.log(typeof stock_record);
        let time=stock_record["Meta Data"]["3. Last Refreshed"];
        // console.log(time);
        let curr_volume=stock_record["Time Series (1min)"][time]["5. volume"];

        // console.log(time_data[Object.keys(time_data)[0]]);
        let curr_date=new Date();

        Webhooks.find({userId:user_id})
            .exec((err, result) => {
            if (err) {
                res.status(500).json({
                    success: false,
                    message: 'sorry! could not find the user'
                });
            }
            let past_volume=result[0].pastData;
            let threshold=result[0].conditions.difference;

            console.log(past_volume);
            console.log(curr_volume);
            console.log(threshold);
            console.log(Math.abs(past_volume-curr_volume));

            if(threshold<=Math.abs(past_volume-curr_volume)){

                Users.find({_id:user_id})
                    .exec((err,data)=>{
                        console.log(data[0].api_key);
                        console.log(result[0].returning_url);

                        let myJSONObject = {
                            "parameter":"Volume",
                            "parameter changed":Math.abs(past_volume-curr_volume),
                            "api":data[0].api_key
                        };
                        Request({
                            url: result[0].returning_url,
                            method: "POST",
                            json: true,
                            body: myJSONObject
                        }, function (error, response, body){
                            console.log("User notified");
                        });
                    });


            }

            Webhooks.findOneAndUpdate({userId:user_id},{$set:{pastData:curr_volume}})
                .exec((err,result)=>{
                    if (err) {
                        res.status(500).json({
                            success: false,
                            message: 'sorry! could not update the previous request'
                        });
                    }
                });

        });




    });

}
