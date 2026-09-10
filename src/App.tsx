import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import AuthModal from './auth/AuthModal';
import { CartProvider } from './cart/CartContext';
import CartPanel from './cart/CartPanel';
import FallingCubes from './components/FallingCubes';
import Nav from './components/Nav';
import Hero from './components/Hero';
import Intro from './components/Intro';
import Story from './components/Story';
import Footer from './components/Footer';
import Store from './pages/Store';
import Arena from './pages/Arena';
import Account from './pages/Account';
import Academy from './pages/Academy';

function Home() {
  return (
    <>
      <Hero />
      <Intro />
      <Story />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
      <CartProvider>
      <FallingCubes />
      <div className="page">
        <Nav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/store" element={<Store />} />
          <Route path="/arena" element={<Arena />} />
        <Route path="/account" element={<Account />} />
        <Route path="/academy" element={<Academy />} />
          <Route path="*" element={<Home />} />
        </Routes>
        <Footer />
        <CartPanel />
        <AuthModal />
      </div>
      </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
