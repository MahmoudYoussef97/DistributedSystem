const amqp = require("amqplib");

const main = async () => {
  const opt = {
    credentials: require("amqplib").credentials.plain("test", "test")
  };
  const amqpUrl = "amqp://192.168.43.70";
  const connection = await amqp.connect(amqpUrl, opt);
  const channel = await connection.createChannel();

  const queue = "Monitor";

  channel.assertQueue(queue, { durable: false });

  const interval = setInterval(_ => {
    const time = new Date().toJSON();
    const cpuUsage = Math.floor(Math.random() * 100);
    const message = `[${time}] - Server: A - CPU: ${cpuUsage}%`;

    channel.sendToQueue(queue, Buffer.from(message));

    console.info(message);
  }, 5000);

  process.on("exit", _ => {
    connection.close();
    clearInterval(interval);
  });
};

main().catch(console.error);
