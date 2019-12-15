import pika
import uuid
from datetime import datetime


class Slaves():
    def __init__(self,connection,channel,server_name=None):
        self.channel = channel
        self.connection = connection
        self.server_name = server_name # its queue will be same name
        self.result = self.channel.queue_declare(queue=self.server_name+'_out')
        self.callback_queue = self.result.method.queue
        self.response = None
        self.task = None
        self.corr_id = None
        self.status = 0 # 1 == up, 0 == down
        self.cpu = 1000
        self.last_update = datetime.now()

        self.consum_tag = self.channel.basic_consume(
            queue=self.callback_queue,
            on_message_callback=self.callback,
            auto_ack=True)


    def callback(self, ch, method, props, body):
        if self.corr_id == props.correlation_id:
            self.response = body
            print("Response updated: ",self.response.decode("utf-8"))
            self.task = None
            self.channel.basic_cancel(self.consum_tag)

    def call(self, message):
        self.response = None
        if message is None:
            return

        self.corr_id = str(uuid.uuid4())
        self.channel.basic_publish(
            exchange='',
            routing_key=self.server_name,
            properties=pika.BasicProperties(
                reply_to=self.callback_queue,
                correlation_id=self.corr_id,
            ),
            body=str(message))
        
        self.consum_tag = self.channel.basic_consume(
            queue=self.callback_queue,
            on_message_callback=self.callback,
            auto_ack=True)
            
        while self.response is None:
            self.connection.process_data_events()
        print("Task sent to Server: ",self.server_name)
        return self.response

