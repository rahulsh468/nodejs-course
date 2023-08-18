const passport = require("passport");
const AuthService = require("../services/AuthService");
const AdminService = require("../services/AdminService");

const LocalStrategy = require("passport-local").Strategy;
const JWTStrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;
const AdminModel = require('../models/AdminModel');

passport.use(
  new LocalStrategy(
    {
      usernameField: "walletId",
      passwordField: "walletId",
      passReqToCallback: true,
      session: false,
    },
    async (req, walletId, password, done) => {
      try {
        const checkUser = await AuthService.findUserByWalletId(walletId);
        if (checkUser == null) {
          return done(null, false, {
            isPresent: false,
            message: "this is a new User",
          });
        }
        return done(null, checkUser);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.use('local-email', new LocalStrategy(
  AdminModel.authenticate()
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  // User.findById(id, (err, user) => {

  // });
  const user = await AuthService.findUserByWalletId(id);
  done(err, user);
});

const opts = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  "jwt",
  new JWTStrategy(opts, async (jwt_payload, done) => {
    try {
      let user = await AuthService.findUserByWalletId(jwt_payload.id);
      if (user) {
        done(null, user);
      } else {
        done(null, false);
      }
    } catch (err) {
      done(err);
    }
  })
);

passport.use(
  "jwt-admin",
  new JWTStrategy(opts, async (jwt_payload, done) => {
    try {
      console.log("JWT: ", jwt_payload);
      console.log("Entering admin jwt strategy");
      let user = await AdminService.findUserById(jwt_payload._id);
      if (user) {
        done(null, user);
      } else {
        done(null, false);
      }
    } catch (err) {
      done(err);
    }
  })
);
