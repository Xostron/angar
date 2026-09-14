import { Outlet } from 'react-router-dom';
import Header from './widgets/header';
import Footer from './widgets/footer';
import './App.css';
import ModalManager from './providers/modal_manager';

const App = () => {
  return (
    <main className="app-layout">
      <Header />
      <div className="app-content">
        <Outlet />
      </div>
      <Footer />
      <ModalManager />
    </main>
  );
};

export default App;
