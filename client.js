const amqp = require("amqplib");
const generatedUuid = require("uuid/v4");

const main = async () => {
  const args = process.argv.slice(2);
  /*
  if (args.length == 0) {
    console.log("Usage: client.js Single 'ServerName'/All 'A'");
    process.exit(1);
  }
  */
  const opt = {
    credentials: require("amqplib").credentials.plain("test", "test")
  };
  //const amqpUrl = "amqp://192.168.1.24";
  const amqpUrl = "amqp://localhost";
  const connection = await amqp.connect(amqpUrl);
  const channel = await connection.createChannel();

  //const callQueue = "rpc_queue";
  const callQueue = "Call";
  const replayQueue = "Replay";
  const amqpQueue = await channel.assertQueue(replayQueue, { exclusive: true });
  const correlationId = generatedUuid();
  const message = args[0];
  //const message = "5";
  console.log("Requesting state of:", message);
  channel.sendToQueue(callQueue, Buffer.from(message), {
    correlationId: correlationId,
    replyTo: amqpQueue.queue
  });

  channel.consume(
    amqpQueue.queue,
    message => {
      console.log(message.content.toString());
    },
    { noAck: true }
  );

  process.on("exit", _ => {
    connection.close();
  });
};

main().catch(console.error);
