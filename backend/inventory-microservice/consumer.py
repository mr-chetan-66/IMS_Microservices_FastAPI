import logging
import socket
from threading import Event

from database import redis
from model import Product
from redis.exceptions import ResponseError

STREAM = "order_completed"
GROUP = "inventory-group"
logger = logging.getLogger(__name__)


def consume_orders(stop_event: Event):
    consumer_name = f"inventory-{socket.gethostname()}"
    group_ready = False

    while not stop_event.is_set():
        try:
            if not group_ready:
                try:
                    redis.xgroup_create(STREAM, GROUP, id="0-0", mkstream=True)
                except ResponseError as exc:
                    if "BUSYGROUP" not in str(exc):
                        raise
                group_ready = True
                logger.info("Inventory order consumer started")

            messages = redis.xreadgroup(
                GROUP,
                consumer_name,
                {STREAM: ">"},
                count=10,
                block=1000,
            )

            for _, events in messages:
                for message_id, data in events:
                    _process_order(message_id, data)
        except Exception:
            logger.exception("Inventory order consumer failed; retrying")
            stop_event.wait(1)


def _process_order(message_id: str, data: dict):
    try:
        product = Product.get(data["product_id"])
        quantity = int(data["quantity"])
        if quantity <= 0 or product.quantity < quantity:
            raise ValueError(f"Insufficient stock for order {data['order_id']}")

        product.quantity -= quantity
        product.save()
        redis.xack(STREAM, GROUP, message_id)
        logger.info("Inventory updated for order %s", data["order_id"])
    except Exception:
        logger.exception("Could not fulfill order %s", data.get("order_id"))
        try:
            redis.xadd("refund_completed", data, maxlen=1000)
            redis.xack(STREAM, GROUP, message_id)
        except Exception:
            logger.exception("Could not publish refund for order %s", data.get("order_id"))


if __name__ == "__main__":
    consume_orders(Event())
