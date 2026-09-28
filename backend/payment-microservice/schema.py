
from redis_om import HashModel
from pydantic import BaseModel

class OrderCreate(BaseModel):
    product_id:str
    quantity:int
    
class OrderDisplay(HashModel):
    pk:str
    product_id:str
    fee:float
    total:float
    quantity:int
    status:str