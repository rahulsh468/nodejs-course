const Agenda = require("agenda");

const agenda = new Agenda({
  db: {
    address: process.env.MONGOOSE_URL,
    collection: "jobs",
    options: { useNewUrlParser: true, useUnifiedTopology: true },
  },
});

module.exports = agenda;
