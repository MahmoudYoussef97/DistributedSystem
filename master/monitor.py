import pika
import uuid
import time
from datetime import datetime
from task_dis import server_status


class Monitor():
    def __init__(self,connection,channel,slaves_dic):
        self.queue_name = "Call"
        self.channel = channel
        self.connection = connection
        self.corr_id = None
        Monitor.slaves_dic = slaves_dic
        result = channel.queue_declare(queue='monitor_out_queue')
        self.callback_queue = result.method.queue

        # self.channel.basic_consume(
        #     queue=self.callback_queue,
        #     on_message_callback=self.on_response,
        #     auto_ack=True)

    def on_response(self, ch, method, props, body):
        if self.corr_id == props.correlation_id:
            self.response = body
            server_name , cpu_status = server_status(str(body))
            Monitor.slaves_dic[server_name].cpu = cpu_status
            Monitor.slaves_dic[server_name].status = 1
            Monitor.slaves_dic[server_name].last_update = datetime.now()
            print("Server: ",server_name," Updated, status is: ",cpu_status)

    def call(self, message):
        self.response = None
        self.corr_id = str(uuid.uuid4())
        self.channel.basic_publish(
            exchange='',
            routing_key=self.queue_name,
            properties=pika.BasicProperties(
                reply_to=self.callback_queue,
                correlation_id=self.corr_id,
            ),
            body=str(message))

        self.channel.basic_consume(
            queue=self.callback_queue,
            on_message_callback=self.on_response,
            auto_ack=True)
        # self.channel.start_consuming()

        while self.response is None:
            self.connection.process_data_events()

        if Monitor.slaves_dic["A"].cpu != 1000 and Monitor.slaves_dic["B"].cpu != 1000:
            print("Slaves status updated!")
        else:
            time.sleep(1) # wait 1 second to make sure that server is down not delay in our network
            print("waited 1 sec..")

        if  (datetime.now() - Monitor.slaves_dic["A"].last_update).seconds > 5:
            Monitor.slaves_dic["A"].status = 0
        
        if  (datetime.now() - Monitor.slaves_dic["B"].last_update).seconds > 5:
            Monitor.slaves_dic["B"].status = 0

        return self.response

