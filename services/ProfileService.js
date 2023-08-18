const ProfileDAO = require("../dao/ProfileDAO");
const mongoose = require("mongoose");
const cloudinary  = require('../configs/cloudinary')
class ProfileService {
  static async createProfile(
    userName, 
    email, 
    walletId ,
    fieldname,
    originalname,
    encoding,
    mimetype,
    filename,
    destination,
    path,
    size
  ) {
    try {
      const profileData = {
        walletId,
        userName,
        email,
      };

      if (path) {
        // Upload the image to Cloudinary
        const result = await cloudinary.uploader.upload(path, {
          folder: 'admins', // Optional: Set the folder where the image will be stored
          resource_type: 'auto'
        });
        profileData.cloudinaryUrl = result.secure_url;
        profileData.cloudinaryPublicId = result.public_id;
      }
      const userProfile = await ProfileDAO.addProfile(profileData);

      return {
        Success: true,
        Data: userProfile,
      };
    } catch (Error) {
      return { Success: false, Error: Error.message };
    }
  }

  static async getFile(fileId) {
    try {
      const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db);
      const downloadStream = bucket.openDownloadStream(
        mongoose.Types.ObjectId(fileId)
      );
      return new Promise((resolve, reject) => {
        let buffer = Buffer.alloc(0);
        downloadStream.on("data", (chunk) => {
          buffer = Buffer.concat([buffer, chunk]);
        });
        downloadStream.on("end", () => {
          resolve({ buffer, contentType: downloadStream.s.file.contentType });
        });
        downloadStream.on("error", (err) => {
          reject(err);
        });
      });
    } catch (err) {
      return new Error(`Internal server error: ${err.message}`);
    }
  }

  static async getProfile(walletId) {
    try {
      const userProfile = await ProfileDAO.getProfile(walletId);
      if (userProfile) {
        return {
          Success: true,
          Data: userProfile,
        };
      } else {
        return {
          Success: false,
          Data: "Please update your profile",
        };
      }
    } catch (Error) {
      return { Success: false, Error: Error?.message };
    }
  }
}
module.exports = ProfileService;
