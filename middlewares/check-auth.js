const jwt= require('jsonwebtoken');

module.exports = function (req,res,next) {
    try {
        //getting token for bearer authentication
        const token= req.headers.authorization.split(" ")[1];
        //verifying the token
        const decoded = jwt.verify(token, 'secret');
        req.userData= decoded;
        next();
    }catch(error){
        return res.status(401).json({
            success:false,
            message: 'invalid user'
        });
    }
};