const amqp = require("amqplib");

const main = async () => {
  const amqpUrl = "amqp://localhost";
  const connection = await amqp.connect(amqpUrl);
  const channel = await connection.createChannel();

  const queue = "Monitor";
  const specificQueue = "Mahmoud";

  channel.assertQueue(queue, { durable: false });
  channel.assertQueue(specificQueue, { durable: false });

  const time = new Date().toJSON();
  const cpuUsage = Math.floor(Math.random() * 100);
  const message = `[${time}] - Server: A, CPU: ${cpuUsage}%`;

  channel.sendToQueue(specificQueue, Buffer.from(message));
  channel.sendToQueue(queue, Buffer.from(message));

  console.info(message);

  process.on("exit", _ => {
    connection.close();
    clearInterval(interval);
  });
};

main().catch(console.error);
