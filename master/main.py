# from monitor.monitor_rpc import Monitor
import pika
from monitor import Monitor
from slaves import Slaves
from task_dis import taskDistribution

slave_a = None
slave_b = None
monitor = None
selected_slave = None
task = None
task_props = None
chl = None

def task_callback(ch, method, props, body):
    """
    When we get task, we ask one of slaves to return number of recordes in database, then we use it to partition task
    """
    global task, task_props, chl

    body = body.decode("utf-8")
    print(" [.] Task: %s" % body)
    task = body
    task_props = props
    chl = ch

def task_listener(channel):
    global selected_slave , task ,task_props, chl 
    channel.basic_consume(
            queue="tasks",
            on_message_callback=task_callback,
            auto_ack=True)

    print(" [x] Awaiting RPC requests")
    while task is None:
        connection.process_data_events()

    # Get status of servers
    monitor.call("A")

    records = None
    # calculate count of data recordes
    if slave_a.cpu < slave_b.cpu :
        records =  slave_a.call("count")
    else:
        records = slave_b.call("count")

    records = records.decode("utf-8")
    print("distribute Task...")
    taskDistribution(slave_a,slave_b,records)
    print("Finish distribute..")

    task_a = str(slave_a.task[0]) + " " + str(slave_a.task[1]) if slave_a.task[0]!=-1 else None
    task_b = str(slave_b.task[0]) + " " + str(slave_b.task[1]) if slave_b.task[0]!=-1 else None

    slave_a.call(task_a)
    slave_b.call(task_b)

    result_a = int(slave_a.response) if slave_a.response  else 0
    result_b = int(slave_b.response) if slave_b.response  else 0

    result = result_a + result_b
    print(result)

    chl.basic_publish(exchange='',
                     routing_key=task_props.reply_to,
                     properties=pika.BasicProperties(correlation_id = \
                                                         task_props.correlation_id),
                     body=str(result))
    # ch.basic_ack(delivery_tag=method.delivery_tag)

    selected_slave = None
    task = None
    task_props = None
    chl = None
    slave_a.task = None
    slave_b.task = None

    task_listener(channel)

if __name__ == "__main__":

    # connection config
    monitor_host="192.168.1.7"
    monitor_port = 5672
    user="test"
    pas="test"

    # start connection
    print("Start Connection...")
    credentials = pika.PlainCredentials(user, pas)
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(monitor_host,5672,'/',credentials))

    channel_a = connection.channel()
    channel_b = connection.channel()
    channel_task = connection.channel()
    monitor_ch = connection.channel()
    
    # init tasks queue
    channel_task.queue_declare(queue='tasks')


    # slaves objects
    slave_a = Slaves(connection,channel_a,"MasterA")
    slave_b = Slaves(connection,channel_b,"MasterB")
    slaves_dic = {"A":slave_a,"B":slave_b}

    # monitor object 
    monitor = Monitor(connection,monitor_ch,slaves_dic)

    #  wait for rpc from getway
    task_listener(channel_task)
    