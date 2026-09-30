import { Wrapper } from "./Wrapper";
import "./Orders.css";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { INVENTORY_API, PAYMENT_API } from "../api";
import { readCache, writeCache, clearCacheKey } from "../cache";

export const Orders = () => {
    const [id, setId] = useState("");
    const [quantity, setQuantity] = useState("");
    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [productsError, setProductsError] = useState("");
    const [product, setProduct] = useState(null);
    const [productLoading, setProductLoading] = useState(false);
    const [productError, setProductError] = useState("");
    const [submitError, setSubmitError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        let cancelled = false;
        const cacheKey = `${INVENTORY_API}/products/`;
        const cached = readCache(cacheKey, 30000);
        if (Array.isArray(cached)) {
            setProducts(cached);
            setProductsLoading(false);
        }

        void (async () => {
            try {
                const response = await fetch(cacheKey);
                if (!response.ok) throw new Error(`Product list request failed (${response.status})`);
                const content = await response.json();
                if (!Array.isArray(content)) throw new Error("Product list response was invalid");
                if (cancelled) return;
                setProducts(content);
                writeCache(cacheKey, content, 30000);
                setProductsError("");
            } catch (error) {
                if (!cancelled) setProductsError(error.message || "Could not load products");
            } finally {
                if (!cancelled) setProductsLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        let cancelled = false;
        const productId = id.trim();

        if (!productId) {
            setProduct(null);
            setProductError("");
            setProductLoading(false);
            return undefined;
        }

        const cacheKey = `${INVENTORY_API}/products/${productId}`;
        const cached = readCache(cacheKey, 30000);
        if (cached) setProduct(cached);
        setProductLoading(!cached);
        setProductError("");

        void (async () => {
            try {
                const response = await fetch(cacheKey);
                if (!response.ok) {
                    throw new Error(response.status === 404 ? "Product not found" : "Could not load product");
                }
                const content = await response.json();
                if (cancelled) return;
                setProduct(content);
                writeCache(cacheKey, content, 30000);
            } catch (error) {
                if (!cancelled) setProductError(error.message || "Could not load product");
            } finally {
                if (!cancelled) setProductLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [id]);

    const submitOrder = async (e) => {
        e.preventDefault();
        if (!id.trim() || !Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
            setSubmitError("Enter a product ID and a whole-number quantity greater than zero.");
            return;
        }

        setSubmitting(true);
        setSubmitError("");
        try {
            const response = await fetch(`${PAYMENT_API}/order/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    product_id: id.trim(),
                    quantity: Number(quantity),
                }),
            });

            if (!response.ok) {
                const body = await response.json().catch(() => null);
                throw new Error(body?.detail || `Order failed (${response.status})`);
            }

            clearCacheKey(`${INVENTORY_API}/products/`);
            clearCacheKey(`${INVENTORY_API}/products/${id.trim()}`);
            clearCacheKey(`${PAYMENT_API}/order/all`);
            navigate("/orders-history");

        } catch (err) {
            setSubmitError(err.message || "Could not place order");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Wrapper>

            <div className="order-header">
                <h2>Checkout Form</h2>
                <Link to="/" className="btn-back">← Back</Link>
            </div>

            <h1 className="order-banner">Buy your favorite product</h1>

            <form className="order-form" onSubmit={submitOrder}>

                <div className="form-group">
                    <label htmlFor="product-select">Product</label>
                    <select
                        id="product-select"
                        className="input-box"
                        value={id}
                        required
                        disabled={productsLoading || products.length === 0}
                        onChange={(event) => {
                            const selectedProduct = products.find((item) => item.pk === event.target.value);
                            setId(selectedProduct?.pk || "");
                            setProduct(selectedProduct || null);
                        }}
                    >
                        <option value="">
                            {productsLoading ? "Loading products..." : productsError || "Choose a product"}
                        </option>
                        {products.map((item) => (
                            <option key={item.pk} value={item.pk}>
                                {item.name} (ID: {item.pk})
                            </option>
                        ))}
                    </select>
                    <label htmlFor="product-id">Product ID</label>
                    <input
                        id="product-id"
                        name="productId"
                        className="input-box"
                        readOnly
                        required
                        value={id}
                    />
                </div>

                <div className="form-group">
                    <label>Quantity</label>
                    <input
                        type="number"
                        name="quantity"
                        min="1"
                        step="1"
                        required
                        className="input-box"
                        placeholder="Enter quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                    />
                </div>

                <button className="submit-btn" type="submit" disabled={submitting || productLoading || productsLoading || !id}>
                    {submitting ? "Placing order..." : "Buy"}
                </button>
            </form>

            <div className="price-box" aria-live="polite">
                {productLoading ? "Loading product..." : productError || (product ? (
                    <>
                        <div>Unit price with service fee: ${(Number(product.price) * 1.2).toFixed(2)}</div>
                        <div>Total: ${(Number(product.price) * 1.2 * (Number(quantity) || 0)).toFixed(2)}</div>
                    </>
                ) : "Enter a product ID to see its price." )}
            </div>
            {submitError && <p role="alert" className="form-error">{submitError}</p>}

        </Wrapper>
    );
};