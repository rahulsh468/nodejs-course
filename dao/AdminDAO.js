const AdminModel = require('../models/AdminModel');

exports.registerAdmin = async (user) => {
    try {
        const adminUser = await AdminModel.register(
            new AdminModel({email: user.email, username: user.username}),
            user.password,
        );

        return { Success: true, User: adminUser };
    }

    catch(error) {
        return { Success: false, Error: error.message };
    }
}

exports.findUserById = async (userId) => {
    try {
        const adminUser = await AdminModel.findUserById(userId);
        return adminUser;
    }

    catch(error) {
        return { Success: false, Error: error.message };
    }
}