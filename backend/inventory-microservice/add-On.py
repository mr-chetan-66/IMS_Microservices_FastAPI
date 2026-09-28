# from contextlib import asynccontextmanager
# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     #AT STARTUP
#     print("Starting app")
#     if not Product.all_pks():
#         Product(name="Laptop", price=999.99, quantity=10).save()
#         Product(name="Headphone", price=99.99, quantity=10).save()
#         Product(name="Bag", price=9.99, quantity=10).save()
#         Product(name="Chocolate", price=0.99, quantity=10).save()
#         print("Seed data added")
#     else:
#         print("Products already exist in database")
#
#     yield
#
#     #AT SHUTDOWN
#     print("Stopping app")
#
# app = FastAPI(lifespan=lifespan)