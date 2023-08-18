//Auth service go here
"use strict";

const { use } = require("passport");
const AuthDAO = require("../dao/AuthDAO");

class AuthService {
  static async registerUser(walletId) {
    try {
      let createdUser = await AuthDAO.registerUserDAO(walletId);
      return createdUser;
    } catch (error) {
      throw new Error("Error creating user");
    }
  }

  static async updateLastInteracted(walletId, time) {
    try {
      let user = await AuthDAO.updateLastInteracted(walletId, time);
      if (user.Success) {
        return { Success: true, Data: user.Data };
      }
      return { Success: false, Data: null };
    } catch (error) {
      throw new Error("Error Fetching user");
    }
  }

  static async findUserByWalletId(walletId) {
    try {
      let user = await AuthDAO.findUserByWalletId(walletId);
      return user;
    } catch (error) {
      throw new Error("Error Fetching user");
    }
  }
}

module.exports = AuthService;
