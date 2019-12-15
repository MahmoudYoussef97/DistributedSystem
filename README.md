# DistributedSystem
Performing a Distributed System Machine.

## Getting Started
We have some servers working together as they can appear to user as a single machine. They are connecting through a RabbitMQ server on a single machine which is the "Monitor" and Each server has service to work with. Our main servers included in the system are:
* Gateway
* Master
* Monitor
* Slave

The client send the action and filter required to the gateway, then the gateway sends RPC message to the master with required action and filter, after that the master asks the monitor to get all server statues so it can know how to distribute the required action to the slaves. One slave is responsible for getting all records from the rethinkdb and reply to the master with the response. After getting the records of the database the master allocate each slave a portion of the action required by the client. Finally, the master aggregate all the results and send them back to the gateway as it can respond successfully to the client.
### Prerequisites
* [RabbitMQ](https://www.rabbitmq.com) - The message broker used.
* [Erlang](https://www.erlang.org) - programming language used to build massively scalable soft real-time systems with requirements on high availability
* [RethinkDB](https://rethinkdb.com) - The open-source database for the realtime web
* [Node.Js](https://nodejs.org/en/) - JavaScript runtime
* AMQP - Message Protocol
* Pika - Pika is a RabbitMQ (AMQP 0-9-1) client library for Python

### Installing
* 1- Install Node.js. as you can use node package manager to setup your environment with other prerquisites.
* 2- Install RabbitMQ with Erlang.
* 3- [Install rethinkdb](https://rethinkdb.com/docs/install/windows/)
* 4- Install AMQP Message Protocol Via "npm":
```
npm install amqp
```
* 5- Install  Pika as the Master implmented in Python via "pip":
```
pip install pika
```
### How it works
Run the gateway service
```
Gateway Runs Here
```
Run Master
```
Master Runs Here
```
The client sends a http request to the gateway with the action and filter required.
Example: SUM - January --> Summing all the salaries in January.
```
Sending HTTP Request here
```
Gateway sends RPC to the Master with the required action and filter.
```
Sending RPC to the master here
```
Master checks the statues of the slaves via the monitor so we need to run the Monitor.
```
Run Monitor
```
After getting servers statues, now it is the time to distribute the tasks. First is to get the all records from the database.
```
Getting all records from the database
```
Distribute the task to the slaves.
```
Distribute task to slave
```
Getting the result and aggregating it to the gateway to send it back the client
```
Final Result
```

## Authors

* Mahmoud Youssef
* Ahmed Nassar
* Mahmoud Essam
* Abdelrahman Salim
* Mohamed Mahmoud
