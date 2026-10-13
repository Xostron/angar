import { NavLink, useLocation, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './style.css';

const NAV_ITEMS = [
  { label: 'Главная', to: '/', icon: '/icon/main.svg' },
  { label: 'Склад', to: '/building/1', icon: '/icon/warehouse.svg' },
  {
    label: 'Датчики',
    to: '/building/1/sensor/temperature',
    icon: '/icon/sensors.svg',
  },
  {
    label: 'Сигналы',
    to: '/building/1/signal',
    icon: '/icon/notification.svg',
  },
  {
    label: 'Отчеты',
    to: '/building/1/report',
    icon: '/icon/File-security.svg',
  },
  {
    label: 'Настройки',
    to: '/building/1/settings/general',
    icon: '/icon/settings.svg',
  },
];

const Footer = () => {
  const { buildingId } = useParams();
  const curUrl = useLocation();
  if (!buildingId) return;

  //   вставляем buildingId в шаблон NAV_ITEMS
  // (/building/1/signal => /building/${buildingId}/signal)
  const modifiedNavItems = NAV_ITEMS.map((el) => {
    if (el.label === 'Главная' || !buildingId) return el;
    const arr = el.to.split('/');
    const arrModified = arr.map((q) => (q === '1' ? buildingId : q));

    return {
      ...el,
      to: arrModified.join('/'),
    };
  });

  return (
    <footer className="footer">
      <div className="footer__info">Системная информация</div>
      <nav className="footer__menu">
        {modifiedNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => {
              //   return isActive ? 'footer__link active' : 'footer__link';
              return item.to == curUrl.pathname
                ? 'footer__link active'
                : 'footer__link';
            }}
          >
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
