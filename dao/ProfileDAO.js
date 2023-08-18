const Profile = require("../models/AuthModel");

exports.addProfile = async (details) => {
  try {
    const filter = { walletId: details.walletId };
    const update = { $set: details };
    const options = { new: true, upsert: true };

    const profile = await Profile.findOneAndUpdate(filter, update, options);

    return { Success: true, Profile: profile };
  } catch (error) {
    return { Success: false, Error: error.message };
  }
};

exports.getProfile = async (walletId) => {
  try {
    const profile = await Profile.findOne({ walletId: walletId });

    return profile;
  } catch (error) {
    return { Success: false, Error: error.message };
  }
};
