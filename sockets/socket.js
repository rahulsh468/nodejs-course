// const GameDAO = require("../dao/GameDAO");
// const { verifyAndDecodeToken , verifyToken } = require("../middlewares/verifyUser");
// const SocketService = require("../services/socketService");

// const connectSocket = (socketIO) => {

//   socketIO.use((socket, next) => {
//     const token = socket.handshake.auth.token;
//     if (!token) {
//       return next(new Error('Unauthorized'));
//     }
//     const playerId = verifyAndDecodeToken(token).sub;
//     socket.playerId = playerId;

//     next();
//   });

//   socketIO.on("connection", (socket) => {
//     console.log("Socket has been established");
//     const socketService = new SocketService(socketIO, socket);
//     socket.on("join-game", (socketData) => {
//       const userId = socket.playerId;
//       verifyToken(socket, userId, (err) => {
//         if (err) {
//           socketIO.emit("auth-error" , { error: err});
//         }
//         socketService.joinRoom(socketData);
//       });
//     });

//     socket.on("send-data", (socketData) => {
//       verifyToken(socket, userId, (err) => {
//         if (err) {
//           socketIO.emit("auth-error" , { error: err});
//         }
//         socketService.sendDataToRoom(socketData);
//       });
     
//     });

//     socket.on("updated-game-page", verifyToken, (socketData) => {
//       verifyToken(socket, userId, (err) => {
//         if (err) {
//           socketIO.emit("auth-error" , { error: err});
//         }
//         socketService.updateGameListPage(socketData);
//       });
      
//     });

//     socket.on("send_check_mate_data", (socketData) => {
//       verifyToken(socket, userId, (err) => {
//         if (err) {
//           socketIO.emit("auth-error" , { error: err});
//         }
//         socketService.sendCheckMateDataToRoom(socketData);
//       });
      
//     });

//     socket.on("send_draw", (socketData) => {
//       verifyToken(socket, userId, (err) => {
//         if (err) {
//           socketIO.emit("auth-error" , { error: err});
//         }
//         socketService.sendDraw(socketData);
//       });
      
//     });
//     socket.on("draw_accepted", (socketData) => {
//       verifyToken(socket, userId, (err) => {
//         if (err) {
//           socketIO.emit("auth-error" , { error: err});
//         }
//         socketService.acceptDraw(socketData);
//       });
//     });

//     socket.on("send_resign", (socketData) => {
//       verifyToken(socket, userId, (err) => {
//         if (err) {
//           socketIO.emit("auth-error" , { error: err});
//         }
//         socketService.sendResign(socketData);
//       });
//     });

//     socket.on("sendNotification", (socketData) => {
//       verifyToken(socket, userId, (err) => {
//         if (err) {
//           socketIO.emit("auth-error" , { error: err});
//         }
//         socketService.sendNotification(socketData);
//       });
//     });

//     socket.on("reconnection", (socketData) => {
//       socketService.reconnectSocket(socketData);
//     });

//     socket.on("disconnect", () => {
//       socketService.disconnectSocket(socket.id);
//     });
//   });
// };

// module.exports = connectSocket;
const GameDAO = require("../dao/GameDAO");
const SocketService = require("../services/socketService");

const connectSocket = (socketIO) => {
  socketIO.on("connection", (socket) => {
    console.log("Socket has been established");
    const socketService = new SocketService(socketIO, socket);
    socket.on("join-game", (socketData) => {
      socketService.joinRoom(socketData);
    });

    socket.on("send-data", (socketData) => {
      socketService.sendDataToRoom(socketData);
    });

    socket.on("updated-game-page", (socketData) => {
      socketService.updateGameListPage(socketData);
    });

    socket.on("send_check_mate_data", (socketData) => {
      socketService.sendCheckMateDataToRoom(socketData);
    });

    socket.on("send_draw", (socketData) => {
      console.log("DRAW GAME HAS BEEN OCCCUCUUCUCUUCUCUUC");
      socketService.sendDraw(socketData);
    });
    socket.on("draw_accepted", (socketData) => {
      console.log("DRAW GAME HAS BEEN OCCCUCUUCUCUUCUCUUC");
      socketService.acceptDraw(socketData);
    });

    socket.on("send_resign", (socketData) => {
      socketService.sendResign(socketData);
    });

    socket.on("sendNotification", (socketData) => {
      socketService.sendNotification(socketData);
    });

    socket.on("reconnection", (socketData) => {
      socketService.reconnectSocket(socketData);
    });

    socket.on("disconnect", () => {
      socketService.disconnectSocket(socket.id);
    });
  });
};

module.exports = connectSocket;