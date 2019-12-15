const amqp = require("amqplib");
const generatedUuid = require("uuid/v4");

module.exports = async function sendToMaster(message) {
  const opt = {
    credentials: require("amqplib").credentials.plain("test", "test")
  };
  const correlationId = generatedUuid();
  const amqpUrl = "amqp://192.168.43.70";
  const connection = await amqp.connect(amqpUrl, opt);
  const channel = await connection.createChannel();

  const queue = "tasks";
  channel.assertQueue(queue, { durable: false });

  channel.sendToQueue(queue, Buffer.from(message.item), {
    correlationId: correlationId,
    replyTo: 'task'
  });

  // console.info(message);

  process.on("exit", _ => {
    connection.close();
    clearInterval(interval);
  });
};
