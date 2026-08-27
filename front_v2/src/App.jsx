import { Outlet } from 'react-router-dom';
import Header from './cmp/header';
import Footer from './cmp/footer';
import './App.css';

const App = () => {
  return (
    <div className="app-layout">
      <Header />
      <div className="app-content">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default App;
