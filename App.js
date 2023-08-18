"use strict";
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const logger = require("morgan");
const passport = require("passport");
const app = express();
const httpServer = require("http").Server(app);
const io = require("socket.io")(httpServer);

//CONTROLLERS
const AuthController = require("./controllers/AuthController");
const GameController = require("./controllers/GameController");
const ContractController = require("./controllers/ContractController");
const ProfileController = require("./controllers/ProfileController");
const StatsController = require("./controllers/StatsController");
const ActiveWalletController = require("./controllers/ActiveWalletController");
const NotificationController = require("./controllers/NotificationController");
const ContactUsController = require("./controllers/ContactController");
const AdminUserController = require("./controllers/AdminUserController");
const ContactAdminController = require("./controllers/ContactAdminController");
const PageContentController = require("./controllers/PageContentController");
const NetworkController = require("./controllers/NetworkController");

//MIDDLEWARES
const auth = require("./middlewares/verifyUser");

//SERVICES
const AuthService = require("./services/AuthService");

const connectSocket = require("./sockets/socket");

//THIRD WEB SDK IMPORTS
const { ThirdwebAuth } = require('@thirdweb-dev/auth/express');
const { PrivateKeyWallet } = require('@thirdweb-dev/auth/evm');

// THIRD WEB SETUP
const { authRouter, authMiddleware, getUser } = ThirdwebAuth({
  domain: process.env.THIRDWEB_AUTH_DOMAIN || "",
  wallet: new PrivateKeyWallet(process.env.THIRDWEB_AUTH_PRIVATE_KEY || ""),
  
  secret: process.env.THIRDWEB_AUTH_SECRETKEY || "",
  // clientId: process.env.THIRDWEB_AUTH_CLIENTID || "",

  // authOptions: {
  //   // Enforce that the user's login message has these exact values
  //   statement: "Please ensure that the domain above matches the URL of the current website.",
  //   version: "1",
  //   chainId: "7701",
  //   domain: "http://provider.europlots.com:30558",
  // },

  callbacks: {
    onLogin: async (address) => {
      const user = await AuthService.findUserByWalletId(address);
      if(!user) {
        console.log("Creating new user . . . ")
        return await AuthService.registerUser(address);
      }
      else {
        console.log("User already exists !");
        return address;
      } 
    },
    onUser: async (user) => {
      return user;
    },
    onLogout: async (user) => {
      return user;
    },
  },
});

class Server {
  constructor() {
    this.connectDB();
    this.useMiddleWares();
    this.routing();
    this.listenServer();
  }

  connectDB() {
    require("./configs/mongoose");
  }

  useMiddleWares() {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // SO AS TO USE AUTH USER FUNCTIONS, ORELSE THIS MIDDLEWARE SHOULD BE ADDED TO EVERY ROUTE
    app.use(authMiddleware);   
 
    require("./middlewares/passport");
    app.use(passport.initialize());
    app.use(
      cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        credentials: true,
      })
    );
    app.use(logger("dev"));
  }

  routing() {
    app.use('/api/v1/auth', authRouter); // AUTH USER ROUTES

    app.use("/api/v1", AuthController);
    
    app.use("/api/v1/user", async(req, res, next)=> {
      const user = await getUser(req);
      if(user) {
        req.user = user.address;
        await auth.updateDailyWallet(user.address);
        return next();
      }
      else return res.status(403).json({message: "Unauthorized request after validating signature!"});
    }, ProfileController);

    app.use("/api/v1/game", async(req, res, next)=> {
      const user = await getUser(req);
      if(user) {
        req.user = user.address;
        await auth.updateDailyWallet(user.address);
        return next();
      }
      else return res.status(403).json({message: "Unauthorized request after validating signature!"});
    }, GameController);

    app.use("/api/v1/contract", async(req, res, next)=> {
      const user = await getUser(req);
      if(user) {
        req.user = user.address;
        return next();
      }
      else return res.status(403).json({message: "Unauthorized request after validating signature!"});
    }, ContractController);

    app.use("/api/v1/notification", async(req, res, next)=> {
      const user = await getUser(req);
      if(user) {
        req.user = user.address;
        await auth.updateDailyWallet(user.address);
        return next();
      }
      else return res.status(403).json({message: "Unauthorized request after validating signature!"});
    }, NotificationController);

    // app.use("/api/v1/dailyWallet", async(req, res, next)=> {
    //   const user = await getUser(req);
    //   if(user) {
    //     req.user = user.address;
    //     return next();
    //   }
    //   else return res.status(403).json({message: "Unauthorized request after validating signature!"});

    // }, ActiveWalletController);

    app.use("/api/v1/responses", auth.verifyAdmin, ContactAdminController);
    app.use("/api/v1/page", PageContentController);
    app.use("/api/v1/admin", AdminUserController);
    app.use("/api/v1/contactUs", ContactUsController);
    app.use("/api/v1/stats", StatsController);
    app.use('/api/v1/network', NetworkController);

    app.use("/v1/docs", require("./docs/docs.route"));

    // No Handler Route
    app.all("/*", function (req, res, next) {
      return res
        .status(404)
        .json({ message: "No handler for your request exists" });
    });

    // error handler
    app.use(function (err, req, res, next) {
      return res
        .status(500)
        .json({ message: "Unhandled internal error", err: err });
    });
  }

  listenServer() {
    connectSocket(io);
    httpServer.listen(process.env.PORT, () => {
      console.log(
        `Server running at http://${process.env.HOST}:${process.env.PORT}`
      );
    });
  }
}

const server = new Server();





version: "2.0" 
services: 
  frontend: 
    image: uchihaitachi468/playmos_frontend:20.0.4 
    env:
      - 'url=https://demodomain.app' 
    expose: 
      - port: 80
        to: 
          - global: true 
        accept: 
          - demodomain.app
          207.246.127.155
profiles: 
  compute: 
    frontend: 
      resources: 
        cpu: 
          units: 8 
        memory: 
          size: 32Gi 
        storage: 
          size: 50Gi 
  placement: 
    akash: 
      pricing: 
        frontend: 
          denom: uakt 
          amount: 10000 
deployment: 
  frontend: 
    akash: 
      profile: frontend 
      count: 1





      version: "2.0"
      services:
        site:
          image: uchihaitachi468/playmos_frontend:20.0.4      
          expose:
            - port: 80
              to:
                - global: true
              accept:
                - demodomain.app
        backend:
          image: uchihaitachi468/playmos_backend:10.0.4  
          env:
            - JWT_SECRET=vrock_pok-ey
            - MONGOOSE_URL=mongodb://playmos:akydh46sgdt46384gdyre65@provider.europlots.com:32508/playmos_qa?retryWrites=true&serverSelectionTimeoutMS=5000&connectTimeoutMS=10000&authSource=admin&authMechanism=SCRAM-SHA-1
            - AGENDA_URL=mongodb://playmos:akydh46sgdt46384gdyre65@provider.europlots.com:32508/agendaDB?retryWrites=true&serverSelectionTimeoutMS=5000&connectTimeoutMS=10000&authSource=admin&authMechanism=SCRAM-SHA-1
            - CANTO_TESTNET_RPC=https://canto-testnet.plexnode.wtf
            - CANTO_PRIVATE_KEY=d5c581ed8b5191cb9f1e03bc413d805a465e8edda3054dc334836ea785e81cc7
            - CONTRACT_WALLET_ADDRESS=0xDeff82CF2288071d037Ec29C7E0cAB3fA099be4D
            - NOTE_TOKE_ADDRESS=0x03F734Bd9847575fDbE9bEaDDf9C166F880B5E5f
            # - CANTO_CONTRACT_ADDRESS=0x0A97a78E5f443529C53EF43073Dc7E1b5Ad44FD1
            - CANTO_CONTRACT_ADDRESS=0x925E0E6Db74b10D232daf0FC44e1Bc5AcAE11348
            - CLOUDINARY_CLOUD_NAME=dj1t4obbz
            - CLOUDINARY_API_KEY=165118881823176
            - CLOUDINARY_API_SECRET=1wZN4TiaJnmmeKHuQNZVH1Mwrek
            - THIRDWEB_AUTH_DOMAIN=http://provider.europlots.com:30558
            - THIRDWEB_AUTH_PRIVATE_KEY=d5c581ed8b5191cb9f1e03bc413d805a465e8edda3054dc334836ea785e81cc7
            - RECAPTCHA_SECRET_KEY=6LddOGAnAAAAAHRsMq95k73Gi7thChTUsyaEYhez
            - THIRDWEB_AUTH_SECRET_KEY=dXpE_JaYp10SZtsMPJMmluWDxqg22nlLXRg81-5CU0RWBuaacEDvTj-l5KAbw4KvABoFwUfkRr4Bzlyd0Xuj0Q
            - THIRDWEB_AUTH_CLIENTID=959c0b64e954010f5c72b2e745e15da4
            - ADMIN_DOMAIN=http://provider.europlots.com:30028
          expose:
            - port: 80
              to:
                - global: true
              accept:
                -   
      profiles:
        compute:
          site:
            resources: 
              cpu: 
                units: 8 
              memory: 
                size: 32Gi 
              storage: 
                size: 50Gi 
          backend:
              resources: 
                cpu: 
                  units: 5 
                memory: 
                  size: 16Gi 
                storage: 
                  - size: 20Gi  
        placement:
          akash: 
            pricing:
              site:
                denom: uakt
                amount: 10000
              backend:
                denom: uakt
                amount: 10000
      deployment:
        site:
          akash:
            profile: site
            count: 1 
        backend:
          akash:
            profile: backend
            count: 1