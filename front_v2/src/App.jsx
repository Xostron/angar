import { Outlet } from 'react-router-dom';
import Header from './widgets/header';
import Footer from './widgets/footer';
import './App.css';

const App = () => {
  return (
    <main className="app-layout">
      <Header />
      <div className="app-content">
        <Outlet />
      </div>
      <Footer />
    </main>
  );
};

export default App;
