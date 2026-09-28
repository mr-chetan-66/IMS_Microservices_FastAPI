from pydantic import BaseModel

class ProductCreate(BaseModel):
    name: str
    price: float
    quantity: int

class ProductDisplay(BaseModel):
    pk:str
    name: str
    price: float
    quantity: int