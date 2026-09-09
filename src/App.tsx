import FallingCubes from './components/FallingCubes';
import Hero from './components/Hero';
import CubePlayground from './components/CubePlayground';
import Story from './components/Story';
import Footer from './components/Footer';

export default function App() {
  return (
    <>
      <FallingCubes />
      <div className="page">
        <Hero />
        <CubePlayground />
        <Story />
        <Footer />
      </div>
    </>
  );
}
