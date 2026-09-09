import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './cart/CartContext';
import CartPanel from './cart/CartPanel';
import FallingCubes from './components/FallingCubes';
import Nav from './components/Nav';
import Hero from './components/Hero';
import CubePlayground from './components/CubePlayground';
import Story from './components/Story';
import Footer from './components/Footer';
import Store from './pages/Store';

function Home() {
  return (
    <>
      <Hero />
      <CubePlayground />
      <Story />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
      <FallingCubes />
      <div className="page">
        <Nav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/store" element={<Store />} />
          <Route path="*" element={<Home />} />
        </Routes>
        <Footer />
        <CartPanel />
      </div>
      </CartProvider>
    </BrowserRouter>
  );
}
