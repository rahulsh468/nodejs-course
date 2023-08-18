const NotificationModel = require("../models/NotificationModel");

exports.getNotifications = async (walletId) => {
  try {
    const notifications = await NotificationModel.find({
      walletId: walletId,
      isRead: false,
    }).sort({ createdAt: -1 });
    if (notifications !== null) {
      return { Success: true, notifications: notifications };
    } else {
      return { Success: false, Error: "DAO error (getNotification)" };
    }
  } catch (error) {
    return { Success: false, Error: error.message };
  }
};

exports.createNotification = async (details) => {
  try {
    const notification = await NotificationModel.create(details);
    if (notification._id !== null) {
      return { Success: true, Notification: notification };
    } else {
      return { Success: false, Error: "DAO error (createNotification)" };
    }
  } catch (error) {
    return { Success: false, Error: error.message };
  }
};
exports.readNotification = async (details) => {
  try {
    const updatedNotification = await NotificationModel.findByIdAndUpdate(
      details.notificationId,
      { isRead: details.status },
      { new: true }
    );
    if (updatedNotification._id !== null) {
      return { Success: true, Notification: updatedNotification };
    } else {
      return { Success: false, Error: "DAO error (readNotification)" };
    }
  } catch (error) {
    return { Success: false, Error: error.message };
  }
};
exports.markAllAsRead = async (walletId, readStatus) => {
  try {
    // console.log(walletId, readStatus);
    const updatedNotification = await NotificationModel.updateMany(
      { walletId: walletId },
      { isRead: readStatus },
      { new: true }
    );
    if (updatedNotification.nModified > 0) {
      return {
        Success: true,
        Notification: "All Notifications Marked As Updated",
      };
    } else {
      return { Success: false, Error: "DAO error (markAllAsRead)" };
    }
  } catch (error) {
    return { Success: false, Error: error.message };
  }
};
