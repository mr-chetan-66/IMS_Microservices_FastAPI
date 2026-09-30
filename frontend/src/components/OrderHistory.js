import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Wrapper } from "./Wrapper";
import { PAYMENT_API } from "../api";
import { readCache, writeCache } from "../cache";

export const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        void (async () => {
            const cacheKey = `${PAYMENT_API}/order/all`;
            const cached = readCache(cacheKey, 30000);
            if (Array.isArray(cached)) {
                setOrders(cached);
                setLoading(false);
            }

            try {
                const response = await fetch(`${PAYMENT_API}/order/all`);
                if (!response.ok) {
                    throw new Error(`Order history request failed (${response.status})`);
                }
                const content = await response.json();
                if (!Array.isArray(content)) {
                    throw new Error("Order history response was invalid");
                }
                if (cancelled) return;
                setOrders(content);
                writeCache(cacheKey, content, 30000);
                setError("");
            } catch (error) {
                console.error("Failed to load order history", error);
                if (!cancelled) setError("Could not load order history. Please try again.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
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
                        {loading && orders.length === 0 ? (
                            <tr><td colSpan="6" role="status" style={{ textAlign: "center" }}>Loading orders...</td></tr>
                        ) : error && orders.length === 0 ? (
                            <tr><td colSpan="6" role="alert" style={{ textAlign: "center" }}>{error}</td></tr>
                        ) : orders.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: "center", color: "#64748b" }}>
                                    {error || "No orders found."}
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