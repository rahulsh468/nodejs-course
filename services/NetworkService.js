const NetworkDAO = require('../dao/NetworkDAO');

exports.createNetwork = async(details) => {
    try {
        const result = await NetworkDAO.createNetwork(details);
        return result;
    }

    catch(err) {
        return { Success: false, Error: err }
    }
}

exports.getNetworkIdByNumber = async(number) => {
    try {
        const result = await NetworkDAO.getNetworkIdByNumber(number);
        return result;
    }

    catch(err) {
        return { Success: false, Error: err.message }
    }
}

exports.getNetworkCurrencyByNumber = async(number) => {
    try {
        const result = await NetworkDAO.getNetworkCurrencyByNumber(number);
        return result;
    }

    catch(err) {
        return { Success: false, Error: err.message }
    }
}

exports.getAllNetworks = async()=> {
    try {
        const result = await NetworkDAO.getAllNetworks();
        if(!result.Success) return result;

        const networks = result.Data;
        const filtered_networks = networks.map((network)=> {
            return {
                label: network.Network_name,
                key: network.Network_id,
                currency: network.Currency_label
            }
        });

        return { Success: true, Data: filtered_networks };
    }

    catch(error) {
        return { Success: false, Error: error.message };
    }
}