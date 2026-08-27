import { NavLink } from 'react-router-dom';
import './style.css';

const NAV_ITEMS = [
  { label: 'Главная', to: '/', icon: '/icon/main.svg' },
  { label: 'Склад', to: '/building/1', icon: '/icon/warehouse.svg' },
  { label: 'Датчики', to: '/building/1/sensor/temperature', icon: '/icon/sensors.svg' },
  { label: 'Сигналы', to: '/building/1/signal', icon: '/icon/notification.svg' },
  { label: 'Отчеты', to: '/building/1/report', icon: '/icon/File-security.svg' },
  { label: 'Настройки', to: '/building/1/settings/general', icon: '/icon/settings.svg' },
];

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__info">Системная информация</div>
      <nav className="footer__menu">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} className="footer__link">
            <span
              className="footer__icon"
              style={{
                maskImage: `url(${item.icon})`,
                WebkitMaskImage: `url(${item.icon})`,
              }}
            />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </footer>
  );
};

export default Footer;
