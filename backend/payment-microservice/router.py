from fastapi import APIRouter
import db_func
from schema import OrderDisplay,OrderCreate
from typing import List

router=APIRouter(
    prefix='/order',
    tags=['order']
)

@router.get("/all",response_model=List[OrderDisplay])
def get_order_all():
    return db_func.get_all_order()

@router.get("/{pk}",response_model=OrderDisplay)
def get_order(pk:str):
    return db_func.get_order(pk)

@router.post("/", response_model=OrderDisplay)
def post_order(request: OrderCreate):
    return db_func.post_order(request)


@router.delete("/all")
def delete_all_orders():
    return db_func.delete_all_order()

@router.delete("/{pk}")
def delete_order(pk: str):
    return db_func.delete_order(pk)
