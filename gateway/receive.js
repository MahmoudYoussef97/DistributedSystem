const amqp = require("amqplib");
module.exports = async function receiveFromMaster() {
  const amqpUrl = "amqp://localhost";
  const connection = await amqp.connect(amqpUrl);
  const channel = await connection.createChannel();

  let mess;
  const queue = "Monitor";
  channel.assertQueue(queue, { durable: false });

  channel.consume(
    queue,
    message => {
      mess = message && message.content.toString();
    },
    { noAck: false }
  );

  process.on("exit", _ => {
    return mess;
    connection.close();
  });
};

// main().catch(console.error);
