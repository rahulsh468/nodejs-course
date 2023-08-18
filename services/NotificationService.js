const NotificationDAO = require("../dao/NotificationDAO");

exports.createNotification = async (details) => {
  try {
    let notifificationObject = {
      walletId: details.walletId,
      message: details.message,
      gameId: details.gameId ? details.gameId : null,
    };
    // console.log("NOTIFICATION OBJ", notifificationObject);
    const notification = await NotificationDAO.createNotification(
      notifificationObject
    );
    return { Success: true, Notification: notification };
  } catch (error) {
    return { Success: false, Error: error.message };
  }
};

exports.readNotification = async (details) => {
  try {
    const updatedNotification = await NotificationDAO.readNotification(
      details.notificationId,
      true
    );
    if (updatedNotification.Success)
      return { Success: true, Notification: updatedNotification.Notification };
    else return { Success: false, Error: updatedNotification.Error };
  } catch (error) {
    return { Success: false, Error: error.message };
  }
};

exports.getNotifications = async ({ walletId }) => {
  try {
    const notifications = await NotificationDAO.getNotifications(walletId);
    if (notifications.Success)
      return { Success: true, Notification: notifications.notifications };
    else return { Success: false, Error: notifications.Error };
  } catch (error) {
    return { Success: false, Error: error.message };
  }
};
exports.markAllAsRead = async ({ walletId }) => {
  try {
    const notifications = await NotificationDAO.markAllAsRead(walletId, true);
    if (notifications.Success)
      return { Success: true, Notification: notifications.Notification };
    else return { Success: false, Error: notifications.Error };
  } catch (error) {
    return { Success: false, Error: error.message };
  }
};
