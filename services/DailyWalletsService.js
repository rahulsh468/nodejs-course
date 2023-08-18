const DailyWalletDAO = require('../dao/DailyWalletsDAO');

exports.updateDailyWalletCount = async(walletId) => {
    try {
        const date = new Date().toISOString();
        const service = await DailyWalletDAO.updateDailyWalletCount(walletId, date);
        return service;
    }

    catch(error) {
        return {Success: false, Record: error.message};
    }
}