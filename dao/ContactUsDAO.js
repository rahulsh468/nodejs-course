const ContactUsModel = require('../models/ContactusModel');

exports.getAllDetails = async () => {
    try {
        const records = await ContactUsModel.find({});
        return { Success: true, Data: records };
    }

    catch(error) {
        return { Success: false, Error: error.message };
    }
}

exports.postDetails = async (details) => {
    try {
        const records = await ContactUsModel.create(details);
        return { Success: true, Data: records };
    }

    catch(error) {
        return { Success: false, Error: error.message };
    }
}
