from schema import ProductCreate
from model import Product
from fastapi import HTTPException,status

def get_all_products():
    products=Product.all_pks()
    if not products:
        return []
    pl=[Product.get(pk) for pk in products]
    return sorted(pl,key=lambda x:(x.price,x.name), reverse=True)

def get_product(pk:str):
    product=Product.get(pk)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product Not Found!!")

    return product


def update_stock(pk: str, quantity: int):
    product = Product.get(pk)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product Not Found!!")

    if quantity < 0 and abs(quantity) > product.quantity:
        raise HTTPException(status_code=400, detail="Not enough stock available")

    product.quantity += quantity
    product.save()
    return product

def create_product_db(product: ProductCreate):
    db_product = Product(**product.model_dump())
    db_product.save()
    return db_product

def update_product(pk:str,product:ProductCreate):
    p=Product.get(pk)
    if not p:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Product Not Found!!")
    p.name=product.name
    p.price=product.price
    p.quantity=product.quantity
    p.save()
    return p

def delete_product_db(pk:str):
    product=Product.get(pk)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product Not Found")
    Product.delete(pk)
    return {"message": "Product deleted"}
