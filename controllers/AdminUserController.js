const express = require("express");
const router = express.Router();

const passport = require('passport');
const AuthMiddleware = require('../middlewares/passport');
const verifyUser = require('../middlewares/verifyUser');
const AdminService = require("../services/AdminService");

// ENABLE ONLY FOR DEBUGGING PURPOSES
// router 
// .post('/register', async(req, res)=> {
//     try {
//         const data = await AdminService.registerAdmin(req.body);
//         if(!data.Success) throw new Error(data.Error);
//         else {
//             return res.status(200).json({
//                 status: true,
//                 token: data.token
//             });
//         }
//       } catch (error) {
//         return res.status(500).json({
//           status: false,
//           data: null,
//           error: error.message,
//         });
//       }
// });

router.post('/login', async (req, res) => {
  try {
      passport.authenticate('local-email', (err, user, info) => {
        if (err) {
          return res.status(500).json({
              status: true,
              data: null,
              error: err.message
          });
        }
        else if (user) {
            const token = verifyUser.getToken({ _id: user._id });
            return res.status(200).json({
              status: true,
              data: token,
          });
        }
        else if (info) {
          return res.status(403).json({
            status: true,
            data: null,
            error: info
        });
        }
      })(req, res);
  
  } catch (error) {
    return res.status(500).json({
      status: false,
      data: null,
      error: error.message,
    });
  }
});

module.exports = router;