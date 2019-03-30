'use strict';
const mongoose=require('mongoose');

const Webhooks=require('../models/webhook').Webhooks;
const Users=require('../models/user').Users;
const schedule = require('node-schedule');
const Request = require("request");

//API key for accessing stocks API
const key='TA2O8Q047EBT10HI';

//global schedules object
let schedules = {};

//adding the webhook
exports.addWebhook=(req,res)=>{

    //getting all the parameters from the user
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

    //storing the new webhook record
    webhookRecord.save((err,result)=>{
        if (err) {
            res.status(500).json({
                success: false,
                message: 'sorry! Weebhook can not be added. Please try again'
            });
        }else{

            //creating a schedules for each users which is run regularly after a defined time interval
            schedules[user_id] = schedule.scheduleJob('*/'+time_interval+' * * * *', function(){
                // console.log(user_id);
                getData(user_id);

            });

        }
    });



}

//fetching the data from the API
function getData(user_id) {
    //the stock price API
    let url="https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=MSFT&interval=1min&apikey="+key;
    let data=Request.get(url,(err,response,body)=>{
        if(err){
            console.log('error fetching data from the remote server');
        }
        let stock_record=JSON.parse(body);

        //getting the current volume from the data

        // console.log(stock_record);
        // console.log(typeof stock_record);
        let time=stock_record["Meta Data"]["3. Last Refreshed"];
        // console.log(time);
        let curr_volume=stock_record["Time Series (1min)"][time]["5. volume"];

        // console.log(time_data[Object.keys(time_data)[0]]);
        let curr_date=new Date();

        //getting the previous voulme from the database and comparing it with the new volume
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

            //if the difference between past and the new volume crosses specified threshold value them
                //triggering the webhook
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

                        //sending a post request to callback URL mentioned by the user
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

            //updating the past volume data in the database
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
