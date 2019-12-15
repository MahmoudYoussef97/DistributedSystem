const express = require("express");
const router = express.Router();
const sendToMaster = require("../send");
const amqp = require("amqplib");

router.get("/", async (req, res) => {
  // mqrabbit request
  await sendToMaster({ item: "salary" });

  // const returnedMessage = await receiveFromMaster();

  const amqpUrl = "amqp://192.168.43.70";
  const opt = {
    credentials: require("amqplib").credentials.plain("test", "test")
  };
  const connection = await amqp.connect(amqpUrl, opt);
  const channel = await connection.createChannel();
  let mess;
  const queue = "task";
  channel.assertQueue(queue, { durable: false });

  channel.consume(
    queue,
    message => {
      mess = message && message.content.toString();
      console.log(mess);
      channel.ack(message);
      res.send(message.content.toString());
    },
    { noAck: false }
  );

  process.on("exit", _ => {
    return mess;
    connection.close();
  });
});

module.exports = router;
