import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Wrapper } from "./Wrapper";
import { PAYMENT_API } from "../api";
import { readCache, writeCache } from "../cache";

export const OrderHistory = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        void (async () => {
            try {
                const cacheKey = `${PAYMENT_API}/order/all`;
                const cached = readCache(cacheKey, 30000);
                if (cached) {
                    setOrders(cached);
                }

                const response = await fetch(`${PAYMENT_API}/order/all`);
                const content = await response.json();
                setOrders(content);
                writeCache(cacheKey, content, 30000);
            } catch (error) {
                console.error("Failed to load order history", error);
                setOrders([]);
            }
        })();
    }, []);

    return (
        <Wrapper>
            <div className="page-header">
                <h2 style={{ margin: 0 }}>Order History</h2>
                <div className="header-buttons">
                    <Link to="/" className="btn-blue">Back to Products</Link>
                </div>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Product ID</th>
                            <th>Quantity</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Placed At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: "center", color: "#64748b" }}>
                                    No orders found.
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order.pk}>
                                    <td>{order.pk}</td>
                                    <td>{order.product_id}</td>
                                    <td>{order.quantity}</td>
                                    <td>{Number(order.total || 0).toFixed(2)}</td>
                                    <td>
                                        <span className={order.status === "completed" ? "stock-ok" : order.status === "refund" ? "stock-low" : "stock-ok"}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td>{order.created_at ? new Date(order.created_at).toLocaleString() : "-"}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Wrapper>
    );
};