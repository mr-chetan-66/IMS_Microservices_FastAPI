# Inventory Management System

A small inventory and ordering application built with React, FastAPI, Redis, and Redis Streams. The inventory and payment APIs run as separate services.

## Requirements

- Python 3.10 or later
- Node.js and npm
- A Redis instance with Redis Stack/Search support (Redis Cloud is suitable)

## Configuration

Create a `.env` file in the repository root with your Redis connection details:

```env
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_USERNAME=default
REDIS_PASSWORD=your-redis-password
```

Do not commit `.env` or share its credentials. Install the Python dependencies from the repository root:

```powershell
python -m pip install -r requirement.txt
```

Install the frontend dependencies:

```powershell
Set-Location .\frontend
npm install
```

## Run the application

Open separate PowerShell terminals for the following processes. Run each command from the repository root unless the command changes directory.

### Inventory API

```powershell
Set-Location .\backend\inventory-microservice
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

### Payment API

```powershell
Set-Location .\backend\payment-microservice
python -m uvicorn main:app --host 127.0.0.1 --port 8001
```

### Inventory stream consumer

Run this process to subtract ordered quantities from inventory. The order event is processed asynchronously.

```powershell
Set-Location .\backend\inventory-microservice
python consumer.py
```

### Payment refund consumer

Run this process to update order status when an inventory event cannot be fulfilled.

```powershell
Set-Location .\backend\payment-microservice
python consumer.py
```

### React frontend

```powershell
Set-Location .\frontend
npm start
```

Open the URL shown by Create React App, typically http://localhost:3000. If that port is already in use, accept the alternate port prompt; the APIs allow ports 3000 and 3001.

## Main screens and API routes

- Product inventory: `/` in the frontend; `GET /products/`, `POST /products/`, `GET /products/{product_id}`, `PUT /products/{product_id}`, and `DELETE /products/{product_id}` on port 8000.
- Create an order: `/order` in the frontend; `POST /order/` on port 8001.
- Order history: `/orders-history` in the frontend; `GET /order/all` on port 8001.
- Interactive API documentation: http://127.0.0.1:8000/docs and http://127.0.0.1:8001/docs.

Order creation first checks that the product exists and has enough stock. The inventory consumer then processes the `order_completed` Redis stream and updates stock; run it for quantities to decrease. Order status and stock changes are asynchronous.

## Frontend checks

From the `frontend` directory:

```powershell
npm run build
```