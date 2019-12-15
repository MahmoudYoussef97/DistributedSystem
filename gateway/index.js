const express = require("express");
const app = express();

require("./routes")(app);

const sendToMaster = require("./send");
const amqp = require("amqplib");

const port = 3000;
app.listen(port);
