const express = require("express");
const home = require("./routes/home");
const count = require("./routes/count");
const restult = require("./routes/result");

module.exports = function(app) {
  app.use(express.json());
  app.use("/", home);
  app.use("/api/count", count);
  app.use("/api/result", restult);
};
