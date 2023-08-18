const GameDAO = require("../dao/GameDAO");

const rooms = [];

class SocketService {
  constructor(io, socket) {
    // This is the socket connection
    this.io = io;
    // This is the Frontend client Listner
    this.socket = socket;

    // this.emitters = new Map();

    this.socket.on("disconnect", this.disconnectSocket.bind(this));
    this.socket.on("reconnect", this.reconnectSocket.bind(this));
  }

  // createEmitter(gameId){
  //   const emitter = new EventEmitter();
  //   this.emitters.set(gameId , emitter);

  // }

  async joinRoom(data) {
    const { io, socket } = this;
    // gameId: '644965eac0cf9c1f933b9494',
    // playerId: '0xDeff82CF2288071d037Ec29C7E0cAB3fA099be4D'
    const { gameId, playerId } = data;
    let room = rooms.find((r) => r.gameId === gameId);

    if (!room) {
      room = { gameId, players: [playerId], sockets: [socket.id] };
      rooms.push(room);
    } else {
      if (room.players.length < 2) {
        room.players.push(playerId);
        room.sockets.push(socket.id);
      } else {
        const newRoom = { gameId, players: [playerId], sockets: [socket.id] };
        rooms.push(newRoom);
        room = newRoom;
      }
    }

    // console.log("Rooms :::: ", rooms);
    socket.join(`room-${gameId}`);
    // socket.to(`room-${gameId}`).emit("playerJoined", playerId);

    // console.log(`Player ${playerId} joined room ${gameId}`);
  }

  async sendDataToRoom(data) {
    const { io } = this;
    const { gameId, updated_board, updated_game } = data;
    io.to(`room-${gameId}`).emit("recieve-room-data", data);
  }

  async updateGameListPage(data) {
    const { io, socket } = this;
    const { playerId, status } = data;
    // console.log("GAME LIST PAGE UPDATED");
    io.emit("game-data-updated", {
      playerId: playerId,
      status: status,
    });
  }

  async sendCheckMateDataToRoom(data) {
    const { io } = this;
    const { roomId } = data;
    io.to(`room-${roomId}`).emit("recieve_check_mate_data", data);
  }

  async sendDraw(data) {
    const { io } = this;
    const { gameId, playerId } = data;
    io.to(`room-${gameId}`).emit("recieve_draw_data", data);
  }
  async acceptDraw(data) {
    const { io } = this;
    const { gameId, playerId } = data;
    io.to(`room-${gameId}`).emit("recieve_accept_draw", data);
  }
  async sendResign(data) {
    const { io } = this;
    const { gameId } = data;
    io.to(`room-${gameId}`).emit("recieve_resign_data", data);
  }

  async sendNotification(data) {
    const { io } = this;
    const { gameId } = data;
    io.emit("fetch_new_notification", data);
  }

  async reconnectSocket(data) {
    const { socket } = this;
    const { gameId } = data;
    // console.log("in reconnection ::::: ", gameId);
    socket.join(`room-${gameId}`);
  }

  async disconnectSocket(data) {
    const { io, socket } = this;
    const room = rooms.find((room) => room.sockets.includes(data));
    if (room) {
      room.sockets = room.sockets.filter((s) => s !== data);
      // console.log(`Socket ${data} left room ${room.gameId}`);
    }
  }
}

module.exports = SocketService;
