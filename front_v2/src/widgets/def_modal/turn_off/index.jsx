import useInputStore from '@src/entities/store/input';
import useModalStore from '@src/entities/store/modal';
import useOutputStore from '@src/entities/store/output';
import Button from '@src/shared/ui/button/btn';
import style from './style.module.css';
import { runTime } from '@src/shared/tool/time'
/**
 * Выключить склад
 * @param { idB, bName, product, automode, datestart } props
 * @returns
 */
function TurnOff({ idB }) {
  //   Включить/выкл склад
  const setStart = useOutputStore((s) => s.setStart);
  const closeModal = useModalStore((s) => s.close);
  
  const bCard = useInputStore((s) => s?.input?.bCard?.[idB]);
  const datestart = bCard?.datestart ? runTime(bCard?.datestart, 1) : '';
  
  return (
    <div className={style.container}>
      <h2 className={style.header}>Выключить склад {bCard?.name}?</h2>
      <div className={style.subheader}>
        <span>Продукт: {bCard?.product?.name}</span>
        <span>·</span>
        <span>Режим: {bCard?.automode?.name}</span>
        <span>·</span>
        <span>Время работы:{datestart}</span>
      </div>
      <img
        width="78px"
        height="64px"
        src="/icon/indicator/modal_warning.svg"
        alt=""
      />

      <span className={style.text1}>Склад будет остановлен.</span>
      <span className={style.text2}>
        {' '}
        Все активные процессы будут прерваны.
      </span>

      <div className={style.buttons}>
        <Button
          label="Отмена"
          active={false}
          onClick={() => {
            closeModal();
          }}
        />
        <Button
          label="Отключить"
          active={true}
          onClick={() => {
            setStart({ _id: idB, val: false });
            closeModal(false);
          }}
        />
      </div>
    </div>
  );
}

export default TurnOff;
