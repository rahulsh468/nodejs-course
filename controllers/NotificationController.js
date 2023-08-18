const express = require("express");
const router = express.Router();
const NotificationService = require("../services/NotificationService");

router.post("/", async (req, res) => {
  try {
    const reqBody_details = {
      ...req.body,
      ["walletId"]: req.user
    };

    const notifications = await NotificationService.getNotifications(reqBody_details);
    if (notifications.Success) {
      return res.status(200).json({
        status: true,
        data: notifications.Notification,
        message: "Notifications Fetched Successfully",
        error: null,
      });
    } else {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Operation error ${/getNotification}",
        error: notifications.Error,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      data: null,
      message: "Internal server error",
      error: error.message,
    });
  }
});
router.post("/readNotification", async (req, res) => {
  try {
    // const { walletId } = req.body
    // if(req.user.walletId!==walletId) {
    //   return res.status(403).json({
    //     status: false,
    //     data: null,
    //     message: "Unauthorized request"
    //   });
    // }

    const readNotification = await NotificationService.readNotification(
      req.body
    );
    // console.log(readNotification);
    if (readNotification.Success) {
      return res.status(200).json({
        status: true,
        data: readNotification.Notification,
        message: "Notification Read successfully",
        error: null,
      });
    } else {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Operation error ${/readNotification}",
        error: readNotification.Error,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      data: null,
      message: "Internal server error",
      error: error.message,
    });
  }
});

router.post("/markAllAsRead", async (req, res) => {
  try {
    // const { walletId } = req.body
    // if(req.user.walletId!==walletId) {
    //   return res.status(403).json({
    //     status: false,
    //     data: null,
    //     message: "Unauthorized request"
    //   });
    // }

    const reqBody_details = {
      ...req.body,
      ["walletId"]: req.user
    };
    
    const readNotification = await NotificationService.markAllAsRead(reqBody_details);
    // console.log(readNotification);
    if (readNotification.Success) {
      return res.status(200).json({
        status: true,
        data: readNotification.Notification,
        message: "Notification Read successfully",
        error: null,
      });
    } else {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Operation error ${/markAllAsRead}",
        error: readNotification.Error,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      data: null,
      message: "Internal server error",
      error: error.message,
    });
  }
});

module.exports = router;
