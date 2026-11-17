import { useState, useEffect } from 'react';
import style from './style.module.css';
import useAuthStore from '@src/entities/store/auth';
import useModalStore from '@src/entities/store/modal';
import { useParams } from 'react-router-dom';
import useEquipStore from '@src/entities/store/equipment';

export default function Login({}) {
  const { buildingId: idB } = useParams();
  const isAuth = useAuthStore((s) => s.isAuth);
  const name = useAuthStore((s) => s.name);

  const openModal = useModalStore((s) => s.open);

  return (
    <div className={style.login} onClick={onClick}>
      <Name idB={idB} name={isAuth ? name : 'Войти'} />
    </div>
  );
  function onClick() {
    if (!isAuth) {
      openModal('login');
      return;
    }
    openModal('logout');
  }
}

function Name({ idB, name }) {
  const address = useEquipStore((s) => s.getBld(idB)?.pc?.address?.value);
  return (
    <div className={style.name}>
      <div className={style.name_1}>
        <span>{name}</span>
        {address && <p title={address}>{address}</p>}
      </div>
      <img src={'/icon/indicator/login.svg'} />
    </div>
  );
}
