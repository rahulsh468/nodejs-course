const DailyWalletsModel = require('../models/DailyWalletsModel');
const AuthModel = require('../models/AuthModel');

const formattedDate = (dateString)=> {
    if(dateString===null) return "";

    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; 
    const day = date.getDate();

    const formattedDate = `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
    return formattedDate;
}

exports.createDailyWalletCount = async(walletId, dateString) => {
    try {

        const formatted_currentDate = formattedDate(dateString);

        const updated_user = await AuthModel.findOneAndUpdate(
            { walletId: walletId },
            { $set: { lastInteracted: dateString }},
            { new: true }
        );

        const activeWallet = await DailyWalletsModel.create({
            walletCount: 1,
            Date: dateString,
            DateString: formatted_currentDate
        });


        return { Success: true, Data: "Service Successful" };
    }

    catch(error) {
        return {Success: false, Error: error.message};
    }
}


exports.updateDailyWalletCount = async(walletId, dateString) => {
    try {
        const formatted_currentDate = formattedDate(dateString);

        const activeWalletRecord = await DailyWalletsModel.findOne({DateString: formatted_currentDate});
        if(activeWalletRecord === null) {
            return await this.createDailyWalletCount(walletId, dateString);
        }

        else {

            const user = await AuthModel.find({walletId: walletId});
            const lastInteracted = user[0].lastInteracted;
            
            const formatted_lastInteraction = formattedDate(lastInteracted);

            if(formatted_currentDate!==formatted_lastInteraction) {
                const record = await DailyWalletsModel.findOneAndUpdate(
                    { DateString: formatted_currentDate },
                    { $inc: { walletCount: 1 } },
                    { new: true }
                );

                const userRecord = await AuthModel.findOneAndUpdate(
                    {walletId: walletId},
                    {$set: {lastInteracted: dateString}},
                    {new: true}
                );
            }

            // update ;ast interaction to new time on same day
            else {
                const userRecord = await AuthModel.findOneAndUpdate(
                    {walletId: walletId},
                    {$set: {lastInteracted: dateString}},
                    {new: true}
                );
            }

            return { Success: true, Data: "Service Successful" };
        }
    }

    catch(error) {
        console.log(error.message);
        return {Success: false, Error: error.message};
    }
}