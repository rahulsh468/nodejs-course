const NetworkModel = require('../models/NetworkModel');

exports.createNetwork = async(details) => {
    try {
        const network = await NetworkModel.create(details);
        return { Success: true, Data: network };
    }

    catch(err) {
        return { Success: false, Error: err }
    }
}

exports.getNetworkIdByNumber = async(number) => {
    try {
        const network = await NetworkModel.find({Network_id: number});
        if(network.length===0) throw new Error("Network with this number not found!");
        const id = network[0]._id;
        return id;
    }

    catch(err) {
        return { Success: false, Error: err.message }
    }
}


exports.getNetworkCurrencyByNumber = async(number) => {
    try {
        const network = await NetworkModel.find({_id: number});
        if(network.length===0) throw new Error("Network with this number not found!");
        const id = network[0].Currency_label;
        return id;
    }

    catch(err) {
        return { Success: false, Error: err.message }
    }
}

exports.getAllNetworks = async() => {
    try {
        const networks = await NetworkModel.find({});
        if(networks.length===0) throw new Error("Something went wrong while retrieving networks from DB");
        return { Success: true, Data: networks };
    }

    catch(err) {
        return { Success: false, Error: err.message }
    }
}