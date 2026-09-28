from redis_om import HashModel
from database import redis

class Order(HashModel,index=True):
    product_id:str
    price:float
    fee:float
    total:float
    quantity:int
    status:str # pending/completed/refund

    class Meta:
        database=redis