const AdminDAO = require('../dao/AdminDAO');
const AuthMiddleware = require('../middlewares/verifyUser');

exports.registerAdmin = async (user) => {
    try {
        const adminUser = await AdminDAO.registerAdmin(user);
        if(!adminUser.Success) return adminUser;

        const token = AuthMiddleware.getToken({_id: adminUser.User._id});
        return { Success: true, token: token };
    }

    catch(error) {
        return { Success: false, Error: error.message };
    }
}

exports.findUserById = async (userId) => {
    try {
        const adminUser = await AdminDAO.findUserById(userId);
        return adminUser;
    }

    catch(error) {
        return { Success: false, Error: error.message };
    }
}