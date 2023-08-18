const express = require("express");
const router = express.Router();

const NetworkService = require('../services/NetworkService');

router.get('/', async(req, res, next)=> {
    try {
        const data = await NetworkService.getAllNetworks();
        if(!data.Success) throw new Error("Something went wrong!");
        return res.status(200).json({
            status: true,
            data: data.Data
        });
    }

    catch(error) {
        return res.status(500).json({
            status: false,
            data: null,
            message: "Internal server error",
            error: error.message,
        });
    }
})

module.exports = router;