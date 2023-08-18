"use strict";
require("dotenv").config();
require("./configs/mongoose");

const { startAgenda } = require("./services/AgendaService");

class Server {
  constructor() {
    this.startAgendaService();
  }

  async startAgendaService() {
    startAgenda();
  }
}

const server = new Server();
