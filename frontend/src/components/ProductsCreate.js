import {Wrapper} from "./Wrapper";
import "./Products.css";
import {Link} from "react-router-dom";

export const ProductsCreate = () => {

    const submitForm = async (e) => {
        e.preventDefault();

        const data = {
            name: e.target.name.value,
            price: e.target.price.value,
            quantity: e.target.quantity.value
        };

        await fetch("http://localhost:8000/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        window.location.href = "/";
    };

    return (
        <Wrapper>
            <div className="page-header">
                <h2 style={{margin: 0}}>Create Product</h2>
                <Link to="/" className="btn-back">← Back</Link>
            </div>

            <form onSubmit={submitForm} style={{ marginTop: "20px", maxWidth: "500px" }}>

                <div className="form-floating">
                    <input name="name" className="form-control" placeholder="Name" />
                    <label>Name</label>
                </div>

                <div className="form-floating">
                    <input name="price" type="number" step='0.01' min="0" oninput="this.value = this.value < 0 ? 0 : this.value;" className="form-control" placeholder="Price" />
                    <label>Price</label>
                </div>

                <div className="form-floating">
                    <input name="quantity" type="number" min="0" oninput="this.value=this.value<0?0:this.value;" className="form-control" placeholder="Quantity" />
                    <label>Quantity</label>
                </div>

                <button className="submit-btn" type="submit">Submit</button>
            </form>
        </Wrapper>
    );
};