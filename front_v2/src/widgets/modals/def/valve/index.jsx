import { useState, useEffect } from 'react';
import useInputStore from '@src/entities/store/input';
import useModalStore from '@src/entities/store/modal';
import useOutputStore from '@src/entities/store/output';
import Button from '@src/shared/ui/button/btn';
import style from './style.module.css';
import { runTime } from '@src/shared/tool/time';

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
function Section({ idB, idS, value, closeModal, refDialog }) {
  //   Изменить режим
  const setMode = useOutputStore((s) => s.setMode);
  //   Данные о складе
  const innerSec = useInputStore((s) => s?.input?.innerSec?.[idB]?.[idS]);
  const mode = innerSec?.mode;

  return (
    <div className={style.container}>
      <h2 className={style.header}>Режим работы. {innerSec?.name}</h2>
      <div className={style.subheader}>
        <span>·</span>
        <span>Режим секции: {mode?.[1]}</span>
        <span>·</span>
      </div>

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
      </div>
    </div>
  );
}

export default Section;
