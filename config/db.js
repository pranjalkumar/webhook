const mongoose= require('mongoose');

//connecting to mongoDB instance
mongoose.connect('mongodb://127.0.0.1/webhook');
const db= mongoose.connection;
db.on('error',console.error.bind(console,'connection error'));
db.once('open',function callback() {
    console.log('connection estabilished');
});
exports.db=db;