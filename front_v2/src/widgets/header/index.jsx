import { useState, useEffect } from 'react';
import './style.css';
import useAuthStore from '@src/entities/store/auth';
import useModalStore from '@src/entities/store/modal';
import { useParams } from 'react-router-dom';

const MONTHS = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];

const formatDate = () => {
  const d = new Date();
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

const formatTime = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const Header = () => {
  const [date] = useState(formatDate);
  const [time, setTime] = useState(formatTime);

  useEffect(() => {
    const id = setInterval(() => setTime(formatTime), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="header">
      <div className="header__logo">
        <img src="/icon/logo.svg" alt="Тента" width="104" height="28" />
      </div>
      <div className="header__buildings">Мои склады</div>
      <div className="header__time">
        <span className="header__date">{date}</span>
        <span className="header__time-val">{time}</span>
      </div>
      <Login />
    </header>
  );
};

export default Header;

function Login({}) {
  const { buildingId: idB } = useParams();
  const isAuth = useAuthStore((s) => s.isAuth);
  const name = useAuthStore((s) => s.name);

  const openModal = useModalStore((s) => s.open);

  return (
    <div className="header__auth" onClick={onClick}>
      {isAuth ? name : 'Войти'}
    </div>
  );
  function onClick() {
    if (!isAuth) {
      openModal('login', { idB });
      return;
    }
    openModal('logout', { idB });
  }
}
