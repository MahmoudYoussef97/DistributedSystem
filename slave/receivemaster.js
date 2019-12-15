const amqp = require("amqplib");

var express = require("express");
const r = require("rethinkdb");

let dbConnection;
var app = express();

const connect = async function connectFn() {
  dbConnection = await r.connect({
    host: "localhost",
    port: 28015,
    db: "company"
  });
};
const getCount = async function getCount(table) {
  try {
    const result = await r
      .table(table)
      .count()
      .run(dbConnection);

    const date = await result;
    console.log(date);
    if (date.length === 0) throw new Error("Not Found");

    return date;
  } catch (err) {
    console.log(err);
  }
};

const getSum = async function getSum(table, start, end) {
  try {
    const result = await r
      .table(table)
      .slice(start, end)
      .sum("salary")
      .run(dbConnection);

    const date = await result;
    console.log(date);
    if (date.length === 0) throw new Error("Not Found");

    return date;
  } catch (err) {
    console.log(err);
  }
};

const close = async function closeFn() {
  return dbConnection.close();
};

async function doSum(first, last) {
  const c = await connect();
  const sum = await getSum("salary", first, last);
  await close();
  return sum;
}
async function doCount() {
  const c = await connect();
  const count = await getCount("salary");
  await close();
  return count;
}

const main = async () => {
  const opt = {
    credentials: require("amqplib").credentials.plain("test", "test")
  };
  const amqpUrl = "amqp://192.168.43.70";
  const connection = await amqp.connect(amqpUrl, opt);
  const channel = await connection.createChannel();

  const queue = "MasterA";
  channel.assertQueue(queue, { durable: false });

  channel.consume(
    queue,
    async message => {
      console.log(message && message.content.toString());

      if (message.content.toString() == "count") {
        const count = await doCount();
        channel.sendToQueue(
          message.properties.replyTo,
          Buffer.from(count.toString()),
          {
            correlationId: message.properties.correlationId
          }
        );
      } else {
        const rangestr = message.content.toString();
        const range = rangestr.split(" ");
        const first = parseInt(range[0], 10);
        const last = parseInt(range[1], 10);
        const sum = await doSum(first, last);
        channel.sendToQueue(
          message.properties.replyTo,
          Buffer.from(sum.toString()),
          {
            correlationId: message.properties.correlationId
          }
        );
      } /*
      channel.sendToQueue(message.properties.replyTo, Buffer.from("5"), {
        correlationId: message.properties.correlationId
      });*/
    },
    { noAck: false }
  );

  process.on("exit", _ => {
    connection.close();
  });
};

main().catch(console.error);
