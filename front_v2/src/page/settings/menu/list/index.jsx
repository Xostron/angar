import { useParams } from 'react-router-dom';
import useEquipStore from '@store/equipment';
import data from '../../def';
import Item from './item';
import style from '../style.module.css';
import { useState, useEffect } from 'react';

//Отображение списка  настроек
export default function List({}) {
  const { buildingId } = useParams();
  const getMenuFactory = useEquipStore((s) => s?.getMenuFactory);

  const menuFactory = getMenuFactory(buildingId, data);
  return (
    <section className={style.list_menu}>
      {menuFactory?.map((el, i) => (
        <Item data={el} index={i} key={i} />
      ))}
    </section>
  );
}
