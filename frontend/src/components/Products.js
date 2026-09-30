import { Wrapper } from "./Wrapper";
import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import "./Products.css";
import { INVENTORY_API } from "../api";
import { readCache, writeCache, clearCacheKey } from "../cache";

export const Products = () => {

    const [product, setProduct] = useState([]);
    const [lowStockCount, setLowStockCount] = useState(0);

    useEffect(() => {
        void (async () => {
            const cacheKey = `${INVENTORY_API}/products`;
            const cached = readCache(cacheKey, 30000);
            if (cached) {
                setProduct(cached);
                setLowStockCount(cached.filter((item) => item.quantity <= 5).length);
            }

            const response = await fetch(`${INVENTORY_API}/products`);
            const content = await response.json();
            setProduct(content);
            setLowStockCount(content.filter((item) => item.quantity <= 5).length);
            writeCache(cacheKey, content, 30000);
        })();
    }, []);

    const deleteProduct = async (id) => {
        if (window.confirm("Are you really want ot delete this record?")) {
            await fetch(`${INVENTORY_API}/products/${id}`, {
                method: "DELETE"
            });
            clearCacheKey(`${INVENTORY_API}/products`);
            setProduct((prev) => prev.filter((p) => p.pk !== id));
        }
    };

    return (
        <Wrapper>

            <div className="page-header">
                <h2 style={{ margin: 0 }}>Products</h2>

                <div className="header-buttons">
                    <Link to="/orders-history" className="btn-blue">Order History</Link>
                    <Link to="/order" className="btn-blue">Make Order</Link>
                    <Link to="/create" className="btn-blue">Add Product</Link>
                </div>
            </div>

            <div className="summary-grid">
                <div className="summary-card">
                    <span className="summary-label">Total Items</span>
                    <strong>{product.length}</strong>
                </div>
                <div className="summary-card warning-card">
                    <span className="summary-label">Low Stock</span>
                    <strong>{lowStockCount}</strong>
                </div>
                <div className="summary-card success-card">
                    <span className="summary-label">Available Stock</span>
                    <strong>{product.reduce((sum, item) => sum + Number(item.quantity || 0), 0)}</strong>
                </div>
            </div>

            <h1 className="box-title">Product List</h1>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {product.map(product => (
                            <tr key={product.pk}>
                                <td>{product.pk}</td>
                                <td>{product.name}</td>
                                <td>{product.price}</td>
                                <td>
                                    <span className={product.quantity <= 5 ? 'stock-low' : 'stock-ok'}>
                                        {product.quantity}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        className="btn-danger"
                                        onClick={() => deleteProduct(product.pk)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </Wrapper>
    );
};