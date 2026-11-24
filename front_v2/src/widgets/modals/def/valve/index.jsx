import { useState, useEffect } from 'react';
import useInputStore from '@src/entities/store/input';
import useModalStore from '@src/entities/store/modal';
import useOutputStore from '@src/entities/store/output';
import Button from '@src/shared/ui/button/btn';
import style from './style.module.css';
import { runTime } from '@src/shared/tool/time';
import InputNum from '@src/shared/ui/input';

const dictMode = {
  true: 'Авто',
  false: 'Ручной',
  null: 'Выкл. секцию',
  undefined: 'Выкл. секцию',
};

/**
 * Выключить склад
 * @param { object } props
 * @param {string} props.idB
 * @param {string} props.idS
 * @param {string} props.value Значение режима
 * @returns
 */
function Section({ data, closeModal, refDialog }) {
//   console.log(11, data);

  const setO = useOutputStore((s) => s.setO);
  const setT = useOutputStore((s) => s.setT);
  const setTune = useOutputStore((s) => s.setTune);
  const sendTune = useOutputStore((s) => s.sendTune);

  //   Изменить режим
  //   const setMode = useOutputStore((s) => s.setMode);
  //   //   Данные о складе
  //   const innerSec = useInputStore((s) => s?.input?.innerSec?.[idB]?.[idS]);
  //   const mode = innerSec?.mode;

  return (
    <div className={style.container}>
      <h2 className={style.header}>{data.name} клапан</h2>

      <span className={style.text2}>Выберите режим работы</span>
      <div className={style.buttons_automode}>
        {[
          { code: 'opn', name: 'Открыть' },
          { code: 'cls', name: 'Закрыть' },
          { code: 'stop', name: 'Стоп' },
        ].map((el) => (
          <Button
            key={el.code}
            label={el.name}
            active={el.code === data.state}
            onClick={() => {}}
            variant="grow"
          />
        ))}
      </div>

      <span className={style.text}>Введите процент открытия клапана</span>
      <InputNum />

      <div className={style.buttons}>
        <Button
          label="Отмена"
          active={false}
          onClick={() => {
            closeModal();
          }}
          variant="grow"
        />
        <Button
          label="Включить"
          active={true}
          onClick={() => {
            setStart({ _id: idB, val: true });
            closeModal(bCard?.start);
          }}
          variant="grow"
        />
      </div>

      {/* 
     

      <div className={style.buttons}>
        <Button
          label="Отмена"
          active={false}
          onClick={() => {
            closeModal();
          }}
          variant="grow"
        />
        <Button
          label={dictMode?.[value]}
          active={true}
          onClick={() => {
            setMode({ buildId: idB, _id: idS, val: value });
            closeModal(false);
          }}
          variant="grow"
        />
      </div> */}
    </div>
  );
}

export default Section;
