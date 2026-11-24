import { useState, useEffect } from 'react';
import useInputStore from '@src/entities/store/input';
import useModalStore from '@src/entities/store/modal';
import useOutputStore from '@src/entities/store/output';
import Button from '@src/shared/ui/button/btn';
import style from './style.module.css';
import { runTime } from '@src/shared/tool/time';
const dictAutomode = [
  { code: 'drying', name: 'Сушка' },
  { code: 'cooling', name: 'Хранение' },
  { code: 'defrost', name: 'Дефростация' },
];

const dictAm = {
  drying: 'Сушка',
  cooling: 'Хранение',
  defrost: 'Дефростация',
};
/**
 * Выключить склад
 * @param { idB } props
 * @returns
 */
function TurnOn({ idB, closeModal, refDialog }) {
  //   Включить/выкл склад
  const setStart = useOutputStore((s) => s.setStart);
  //   Изменить авторежим
  const setAutomode = useOutputStore((s) => s.setAutomode);
  //   Данные о складе
  const bCard = useInputStore((s) => s?.input?.bCard?.[idB]);
  const am = bCard?.am;
  const datestop = bCard?.datestop ? runTime(bCard?.datestop, 1) : '';
  // Для быстрого изменения показа авторежима, чтобы не ждать обновленные данные от сервера
  const [amode, setAmode] = useState(am);

  useEffect(() => {
    setAmode(am);
  }, [am]);

  return (
    <div className={style.container}>
      <h2 className={style.header}>Включить склад {bCard?.name}?</h2>
      <div className={style.subheader}>
        <span>Продукт: {bCard?.product?.name}</span>
        <span>·</span>
        <span>Режим: {dictAm?.[am] ?? am}</span>
        <span>·</span>
        <span>
          {datestop ? `Склад включен: ${datestop}` : 'Склад выключен'}
        </span>
      </div>

      <span className={style.text}>Выберите режим для запуска склада</span>

      <div className={style.buttons_automode}>
        {dictAutomode.map((el) => (
          <Button
            key={el.code}
            label={el.name}
            active={el.code === amode}
            onClick={() => {
              setAutomode({ _id: idB, val: el.code });
              setAmode(el.code);
            }}
            variant="grow"
          />
        ))}
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
          label="Включить"
          active={true}
          onClick={() => {
            setStart({ _id: idB, val: true });
            closeModal(bCard?.start);
          }}
          variant="grow"
        />
      </div>
    </div>
  );
}

export default TurnOn;
