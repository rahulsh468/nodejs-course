const jwt = require("jsonwebtoken");
const passport = require("passport");
const DailyWalletsService = require("../services/DailyWalletsService");

const getToken = (user) => {
  return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: 3600 });
};

const verifyUser = async (req, res, next) => {
  try {
    passport.authenticate("jwt", { session: false }, async (err, user) => {
      if (err || !user) {
        return res.status(401).json({ message: "Authentication failed" });
      }

      req.user = {
        id: user._id,
        userName: user.userName || "",
        walletId: user.walletId,
      };

      const walletId = user.walletId;
      const updateWallet = await DailyWalletsService.updateDailyWalletCount(
        walletId
      );

      next();
    })(req, res);
  } catch (e) {
    return res
      .status(401)
      .json({ message: "JWT token is not valid", error: e.message });
  }
};

const verifyAdmin = async (req, res, next) => {
  try {
    passport.authenticate(
      "jwt-admin",
      { session: false },
      async (err, user) => {
        if (err || !user) {
          return res
            .status(401)
            .json({ message: "Authentication failed", error: err });
        }

        next();
      }
    )(req, res);
  } catch (e) {
    return res
      .status(401)
      .json({ message: "JWT token is not valid", error: e.message });
  }
};

const verifyAndDecodeToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (err) {
    console.error('Error verifying token:', err);
    throw new Error('Invalid token');
  }
};

const verifyToken = (socket, next, userId) => {
  const token = socket.handshake.auth.token;
  try {
    const decoded = jwt.verify(token, 'your-jwt-secret-here');
    if (decoded.sub !== userId) {
      throw new Error('Invalid token');
    }
    next();
  } catch (err) {
    console.error('Error verifying token:', err);
    next(new Error('Unauthorized'));
  }
};

exports.updateDailyWallet = async(walletId) => {
  try {
    return await DailyWalletsService.updateDailyWalletCount(walletId);
  }

  catch(error) {
    console.log(error.message);
  }
}

module.exports.verifyUser = verifyUser;
module.exports.verifyAdmin = verifyAdmin;
module.exports.getToken = getToken;
module.exports.verifyAndDecodeToken = verifyAndDecodeToken;
module.exports.verifyToken = verifyToken;
