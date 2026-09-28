
from database import redis
from model import Order

GROUP='payment-group'
STREAM='refund_completed'

try:
    redis.xgroup_create(STREAM,GROUP,mkstream=True)
    print(f"--> Created consumer group: {GROUP}")
except:
    print(f"--> {GROUP}: Group Already Exists")

print("--> payment refund consumer running... Waiting for messages...\n")

while True:
    try:
        message=redis.xreadgroup(GROUP,STREAM,{STREAM:'>'},count=10,block=1000)
        if len(message)!=0:
            print(message)
            for stream_name, event in message:
                for msg_id,data in event:
                    print("\n--> Refund message received")
                    print(f"--> Message ID: {msg_id}")
                    print(f"--> Data: {data}")

                    try:
                        order = Order.get(data["order_id"])
                        print(f"--> Updating order {order.pk} → refund status")

                        order.status = "refund"
                        order.save()

                        print("--> Order updated successfully")
                        redis.xack(STREAM, GROUP, msg_id)
                        print(f"--> Acknowledged message {msg_id}")

                    except Exception as e:
                        print(f"--> Failed to process refund for msg {msg_id}: {e}")

    except Exception as e:
        print(f"--> Error in payment consumer loop: {e}")
