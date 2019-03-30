const mongoose=require('mongoose');

//webhook schema
const webhookSchema= mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    userId:{type:String},
    scanning_url:{type:String},
    conditions:{
        parameter:{type:String},
        difference:{type:Number}
    },
    returning_url:{type:String},
    time_interval:{type:Number},
    time:{type:Date},
    pastData:{type:Number, default:0}
});
//usersid stores the id of the user who created the webhook
//scanning URL stored the URL which needed to be scanned
//conditions stores the condition specified the user (on which parameter the condition has to be imposed, how much should be the difference
//between past and current data to trigger the webhook)
//time interval stores the duration after which server should fetch the new data
//past data stores the just previous data

const webhooks=mongoose.model('webhook',webhookSchema);

module.exports={
    Webhooks:webhooks
}
// module.exports=mongoose.model('Product',productSchema);