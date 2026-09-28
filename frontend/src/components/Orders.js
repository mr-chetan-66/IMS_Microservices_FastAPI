import { Wrapper } from "./Wrapper";
import "./Orders.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export const Orders = () => {

    const [id, setId] = useState("");
    const [quantity, setQuantity] = useState("");
    const [message, setMessage] = useState("Buy your favorite product");

    useEffect(() => {
        (async () => {
            try {
                if (id) {
                    const response = await fetch(`http://localhost:8000/products/${id}`);
                    const content = await response.json();

                    // multiply price just like your logic
                    const price = (parseFloat(content.price) * 1.2).toFixed(2);
                    const total = (price * quantity).toFixed(2);

                    setMessage(`Your product price is $${price}\nTotal= ${total}`);
                }
            } catch (e) {
                setMessage("Product not found");
            }
        })();
    }, [id, quantity]);

    const submitOrder = async (e) => {
        e.preventDefault();

        if (!id || !quantity) {
            alert("Please enter product ID and quantity");
            return;
        }

        try {
            const response = await fetch("http://localhost:8001/order/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    product_id: id,
                    quantity: Number(quantity),
                }),
            });

            if (!response.ok) {
                throw new Error("Order failed");
            }
            alert(`✅ Order placed!`);

        } catch (err) {
            alert("❌ Could not place order");
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
                    <label>Product ID</label>
                    <input
                        name="productId"
                        className="input-box"
                        placeholder="Enter product ID"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Quantity</label>
                    <input
                        type="number"
                        name="quantity"
                        min="0"
                        oninput="this.value=this.value<0?0:this.value;"
                        className="input-box"
                        placeholder="Enter quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                    />
                </div>

                <button className="submit-btn" type="submit">Buy</button>
            </form>

            {/* ✅ PRICE MESSAGE DISPLAYED BELOW FORM */}
            <div className="price-box">
                {message}
            </div>

        </Wrapper>
    );
};