import { useState, useEffect } from 'react';
import useEquipStore from '@src/entities/store/equipment';
import style from './style.module.css';
import { sensList } from './fn';
import dictSensor from '@src/shared/dict/icon_sensor';
import { Sensor } from './sensor';
import { SensorPui } from './pui';
import Button from '@src/shared/ui/button/btn';
/**
 * Рисует карточки разделенные по типажу: Темп улицы, Влажность улицы, Темп канала и т.д.
 * @param {object} props
 * @param {string} props.idB ИД склада
 * @param {string} props.idS ИД страницы
 * @returns
 */
export default function Groups({ idB, idS }) {
  const build = useEquipStore((s) => s.getBld(idB));
  const data = sensList(build, idS);
  //   console.log(11, data);
  return (
    <>
      {data.map((el, i) => (
        <Subgroup key={i} data={el} idB={idB} />
      ))}
    </>
  );
}

/**
 * Карточка с датчиками
 * @param {object} props
 * @param {object} props.data Данные о подгруппе датчиков, например "Температура продукта"
 * @returns
 */
function Subgroup({ data, idB }) {
  const { code, title, list } = data;
  return (
    <article className={style.subgroup}>
      <div className={style.title}>
        <img src={dictSensor?.[code]} alt={code} />
        <span>{title}</span>
      </div>

      <div className={style.subitems} style={{ height: '340px' }}>
        {list
          .sort((a, b) => a?.order - b?.order)
          .slice(0, 2)
          .map((el, i) =>
            code == 'pui' ? (
              <SensorPui el={el} idB={idB} />
            ) : (
              <Sensor key={i} el={el} code={code} idB={idB} />
            ),
          )}
        {list.length > 2 && (
          <Button
            variant="sensor_more"
            label={`+${list.length - 2}`}
            icon="/icon/indicator/next.svg"
          />
        )}
      </div>
    </article>
  );
}
