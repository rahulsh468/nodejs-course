const { clearHash }  = require('../services/cache');

module.exports =async (req,res,next) => {
    // After the route has done it work then this function will access again
    // So in short this will run after res.send() is done
    await next();

    clearHash(req.user.id)

}