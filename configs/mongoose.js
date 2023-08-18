"use strict";
const mongoose = require("mongoose");
const glob = require("glob");
const path = require("path");

// strictQuery ensures that no data is sent if empty values are given in query
mongoose.set("strictQuery", false);

// Create the database connection
mongoose.connect(process.env.MONGOOSE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on("connected", function () {
  console.log(
    "Mongoose default connection open to " + process.env.MONGOOSE_URL
  );
});

// If the connection throws an error
mongoose.connection.on("error", function (err) {
  console.log("Mongoose default connection error: " + err);
  mongoose.disconnect();
});

// When the connection is disconnected
mongoose.connection.on("disconnected", function () {
  console.log("Mongoose default connection disconnected");
});

// If the Node process ends, close the Mongoose connection
process.on("SIGINT", function () {
  mongoose.connection.close(function () {
    console.log(
      "Mongoose default connection disconnected through app termination"
    );
    process.exit(0);
  });
});

// const definedModels = glob.sync("./models/*.js");

// definedModels.forEach((path) => {
//   require(`../models/${path.split("/")[2]}`);
// });
