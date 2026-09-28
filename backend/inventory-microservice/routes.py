from fastapi import APIRouter
import db_func
from schema import ProductCreate,ProductDisplay
from typing import List

router=APIRouter(
    prefix='/products',
    tags=['products']
)

## READ
@router.get("/",response_model=List[ProductDisplay])
def all_products():
    return db_func.get_all_products()

@router.get("/{pk}",response_model=ProductDisplay)
def get_product(pk:str):
    return db_func.get_product(pk)

## CREATE
@router.post("/",response_model=ProductDisplay)
def create_product(product: ProductCreate):
    return db_func.create_product_db(product)

## UPDATE
@router.put("/{pk}", response_model=ProductDisplay)
def update_product(pk:str,product:ProductCreate):
    return db_func.update_product(pk, product)

## DELETE
@router.delete("/{pk}")
def delete_product(pk:str):
    return db_func.delete_product_db(pk)