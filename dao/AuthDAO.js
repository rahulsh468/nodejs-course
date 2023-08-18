//Auth dao go here

const User = require("../models/AuthModel");

class AuthDAO {
  static async registerUserDAO(walletID) {
    try {
      let newUser = new User({
        walletId: walletID,
      });
      const createdUser = await newUser.save();
      return createdUser;
    } catch (error) {
      throw new Error("Error creating user");
    }
  }
  static async updateLastInteracted(walletID, time) {
    try {
      const updatedUser = await User.findOneAndUpdate(
        { walletId: walletID },
        { $set: { lastInteracted: time } },
        { new: true }
      );
      console.log("UPDATED USER :: ", updatedUser);
      return { Success: true, Data: updatedUser };
    } catch (error) {
      throw new Error("Error Fetching user");
    }
  }
  static async findUserByWalletId(walletID) {
    try {
      const user = await User.findOne({ walletId: walletID });
      return user;
    } catch (error) {
      throw new Error("Error Fetching user");
    }
  }
}

module.exports = AuthDAO;
