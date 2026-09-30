import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Wrapper } from "./Wrapper";
import { PAYMENT_API } from "../api";
import { clearCacheKey, readCache, writeCache } from "../cache";

export const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedOrderIds, setSelectedOrderIds] = useState([]);
    const [deleting, setDeleting] = useState(false);

    const orderedOrders = [...orders].sort((first, second) => {
        const firstTime = Date.parse(first.created_at || "") || 0;
        const secondTime = Date.parse(second.created_at || "") || 0;
        return secondTime - firstTime || String(second.pk).localeCompare(String(first.pk));
    });
    const allSelected = orderedOrders.length > 0 && selectedOrderIds.length === orderedOrders.length;

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

    const toggleOrder = (orderId) => {
        setSelectedOrderIds((current) => current.includes(orderId)
            ? current.filter((selectedId) => selectedId !== orderId)
            : [...current, orderId]);
    };

    const deleteOrders = async (orderIds) => {
        if (orderIds.length === 0 || !window.confirm(`Delete ${orderIds.length} selected order(s)?`)) return;

        setDeleting(true);
        setError("");
        const results = await Promise.allSettled(orderIds.map(async (orderId) => {
            const response = await fetch(`${PAYMENT_API}/order/${encodeURIComponent(orderId)}`, { method: "DELETE" });
            if (!response.ok) throw new Error(`Could not delete order ${orderId}`);
            return orderId;
        }));
        const deletedIds = results
            .filter((result) => result.status === "fulfilled")
            .map((result) => result.value);

        setOrders((current) => current.filter((order) => !deletedIds.includes(order.pk)));
        setSelectedOrderIds([]);
        clearCacheKey(`${PAYMENT_API}/order/all`);
        if (deletedIds.length !== orderIds.length) {
            setError("Some orders could not be deleted. Refresh and try again.");
        }
        setDeleting(false);
    };

    const toggleAll = () => {
        setSelectedOrderIds(allSelected ? [] : orderedOrders.map((order) => order.pk));
    };

    return (
        <Wrapper>
            <div className="page-header">
                <h2 style={{ margin: 0 }}>Order History</h2>
                <div className="header-buttons">
                    <button
                        className="btn-danger"
                        type="button"
                        disabled={deleting || selectedOrderIds.length === 0}
                        onClick={() => deleteOrders(selectedOrderIds)}
                    >
                        {deleting ? "Deleting..." : `Delete selected (${selectedOrderIds.length})`}
                    </button>
                    <Link to="/" className="btn-blue">Back to Products</Link>
                </div>
            </div>

            {error && <p role="alert" className="form-error">{error}</p>}

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>
                                <input
                                    type="checkbox"
                                    aria-label="Select all orders"
                                    checked={allSelected}
                                    onChange={toggleAll}
                                />
                            </th>
                            <th>Order ID</th>
                            <th>Product ID</th>
                            <th>Quantity</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Placed At</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && orders.length === 0 ? (
                            <tr><td colSpan="8" role="status" style={{ textAlign: "center" }}>Loading orders...</td></tr>
                        ) : error && orders.length === 0 ? (
                            <tr><td colSpan="8" role="alert" style={{ textAlign: "center" }}>{error}</td></tr>
                        ) : orderedOrders.length === 0 ? (
                            <tr>
                                <td colSpan="8" style={{ textAlign: "center", color: "#64748b" }}>
                                    {error || "No orders found."}
                                </td>
                            </tr>
                        ) : (
                            orderedOrders.map((order) => (
                                <tr key={order.pk}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            aria-label={`Select order ${order.pk}`}
                                            checked={selectedOrderIds.includes(order.pk)}
                                            onChange={() => toggleOrder(order.pk)}
                                        />
                                    </td>
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
                                    <td>
                                        <button
                                            className="btn-danger"
                                            type="button"
                                            disabled={deleting}
                                            onClick={() => deleteOrders([order.pk])}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Wrapper>
    );
};