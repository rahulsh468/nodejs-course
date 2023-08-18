const ContactUsDAO = require('../dao/ContactUsDAO');

exports.getAllDetails = async () => {
    try {
        const records = await ContactUsDAO.getAllDetails();
        return records;
    }

    catch(error) {
        return { Success: false, Error: error.message };
    }
}

exports.postDetails = async (details) => {
    try {
        const records = await ContactUsDAO.postDetails(details);
        return records;
    }

    catch(error) {
        return { Success: false, Error: error.message };
    }
}
