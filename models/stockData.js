const mongoose=require('mongoose');

const stockDataSchema= mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,


});

const stocks=mongoose.model('webhook',stockDataSchema);

module.exports={
    Stocks:stocks
}
// module.exports=mongoose.model('Product',productSchema);