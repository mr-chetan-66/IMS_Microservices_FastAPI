import "./App.css";
import {Products} from "./components/Products";
import {ProductsCreate} from "./components/ProductsCreate";
import {Orders} from "./components/Orders";
import {OrderHistory} from "./components/OrderHistory";
import {BrowserRouter,Routes,Route} from 'react-router-dom'

function App() {
  return (
      <BrowserRouter>
          <Routes>
              <Route path={'/'} element={<Products/>}/>
              <Route path={'/create'} element={<ProductsCreate/>}/>
              <Route path={'/order'} element={<Orders/>}/>
              <Route path={'/orders-history'} element={<OrderHistory/>}/>
          </Routes>
      </BrowserRouter>
  );
}

export default App;