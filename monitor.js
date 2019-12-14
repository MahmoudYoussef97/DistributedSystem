const amqp = require("amqplib");

const main = async () => {
  const amqpUrl = "amqp://localhost";
  const connection = await amqp.connect(amqpUrl);
  const channel = await connection.createChannel();

  const callQueue = "Call";
  const amqpQueue = channel.assertQueue(callQueue, { durable: false });

  console.log("Awaiting RPC Requests");
  channel.consume(amqpQueue.queue, message => {
    if (!message) return;
    const params = message.content.toString();
    //channel.ack(message);
    console.log("Receiving Request: ", params);
    if (params === "A") {
      // let statues = [];
      const queue = "Monitor";
      channel.consume(
        queue,
        msg => {
          console.log(msg && msg.content.toString());
          //statues.push(msg.content.toString());
          //let finalMessage = statues.toString();
          channel.sendToQueue(
            message.properties.replyTo,
            Buffer.from(msg.content.toString()),
            {
              correlationId: message.properties.correlationId
            }
          );
          channel.ack(msg);
        },
        { noAck: false }
      );
    }
    /*
    // ** ------ BONUS ------*
    else {
      channel.consume(
        params,
        msg => {
          console.log(msg && msg.content.toString());
          channel.sendToQueue(
            message.properties.replyTo,
            Buffer.from(msg.content.toString()),
            {
              correlationId: message.properties.correlationId
            }
          );
        },
        { noAck: false }
      );
    }
    */
    channel.ack(message);
  });
  //channel.ack(message);
  process.on("exit", _ => {
    connection.close();
  });
};

main().catch(console.error);
