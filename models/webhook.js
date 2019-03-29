const mongoose=require('mongoose');

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

const webhooks=mongoose.model('webhook',webhookSchema);

module.exports={
    Webhooks:webhooks
}
// module.exports=mongoose.model('Product',productSchema);