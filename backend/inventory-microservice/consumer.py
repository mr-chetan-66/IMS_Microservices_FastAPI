from database import redis
from model import Product

STREAM='order_completed'
GROUP='inventory-group'

try:
    redis.xgroup_create(STREAM, GROUP, id="0-0", mkstream=True)
    print(f"--> Created consumer group: {GROUP}")
except:
    print(f"--> {GROUP}: Group Already Exists")

print("--> inventory-microservice consumer running... Waiting for messages...\n")

while True:
    try:
        message=redis.xreadgroup(GROUP,STREAM,{STREAM:">"},count=10,block=1000)

        for stream_name,event in message:
            for msg_id,data in event:
                print("\n--> Received message from \'order_completed\'")
                print(f"--> Message ID: {msg_id}")
                print(f"--> Data: {data}")

                try:
                    product=Product.get(data['product_id'])
                    qty = int(data['quantity'])
                    if product.quantity < qty:
                        raise ValueError(f"Insufficient stock to fulfill order {data['order_id']}")

                    print(f"--> Updating product {product.pk}, subtracting {qty} units")
                    product.quantity -= qty
                    product.save()
                    print("--> inventory-microservice updated successfully")
                    redis.xack(STREAM, GROUP, msg_id)
                    print(f"--> Acknowledged message {msg_id}")
                except Exception as e:
                    print(f"--> Error updating inventory: {e}")
                    print("--> Sending refund event to refund_completed stream")

                    redis.xadd("refund_completed", data, maxlen=1000)
                    print("--> Refund event sent")
                    redis.xack(STREAM, GROUP, msg_id)
                    print(f"--> Acknowledged failed event {msg_id}")

    except Exception as e:
        print(f"--> Error in consumer loop: {e}")
