//Auth routes go here
const passport = require("passport");
const auth = require("../middlewares/verifyUser");
const express = require("express");
const AuthService = require("../services/AuthService");
const router = express.Router();

router.post("/connectWallet", async (req, res) => {
  const { walletId } = req.body;
  const currentTime = new Date(Date.now());
  try {
    passport.authenticate("local", async (err, user, info) => {
      if (err) {
        return res.status(500).json({
          status: false,
          data: null,
          message: "Error in Passport",
          error: err,
        });
      } else if (user) {
        const token = auth.getToken({ id: walletId });
        // add lastChecked here

        return res.status(200).json({
          status: true,
          data: { token: token },
          message: "User Login Successful",
          error: null,
        });
      } else if (info != undefined && !info.isPresent) {
        {
          try {
            let createUser = await AuthService.registerUser(walletId);
            // await AuthService.updateLastInteracted(walletId, currentTime);
            if (createUser) {
              const token = auth.getToken({ id: walletId });
              return res.status(200).json({
                status: true,
                data: { token: token },
                message: "User Register successful",
                error: null,
              });
            }
          } catch (err) {
            return res.status(403).json({
              status: false,
              data: null,
              message: "User Register Failed",
              error: err.message,
            });
          }
        }
      }
    })(req, res);
  } catch (err) {
    res.status(500).json({
      status: false,
      data: null,
      message: "Request Failed in AuthController(connectWallet)",
      error: err.message,
    });
  }
});

router.get("/currentUserDetails", async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({
      data: { user: user },
      message: "The current User Detail",
      error: null,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      data: null,
      message: "Request Failed in AuthController(currentUserDetails)",
      error: err.message,
    });
  }
});

module.exports = router;
/**
 * @swagger
 * tags:
 *   name: Auth-Routes
 *   description: User Auth Routes handler
 */

/**
 * @swagger
 * /connectWallet:
 *   post:
 *     summary: Register Yourself Using Wallet
 *     tags: [Auth-Routes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - walletId
 *             properties:
 *               walletId:
 *             example:
 *               walletId: "63c98cb5bf70fe2c48851c48"
 *     responses:
 *       "200":
 *         description: OK
 *       "401":
 *         $ref: '#/components/schemas/Unauthorized'
 *       "404":
 *         $ref: '#/components/schemas/NotFound'
 *
 */

/**
 * @swagger
 * /currentUserDetails:
 *   get:
 *     summary: get the details of a logged in user.
 *     tags: [Auth-Routes]
 *     responses:
 *       "200":
 *         description: OK
 *       "401":
 *         $ref: '#/components/schemas/Unauthorized'
 *       "404":
 *         $ref: '#/components/schemas/NotFound'
 *       "500":
 *          $ref: '#/components/schemas/InternalServerError'
 */
