import useOutputStore from '@src/entities/store/output';
import useInputStore from '@src/entities/store/input';
import Toggle2 from '@src/shared/ui/button/toggle_button_2';
import { Sensor, Status } from './row';
import Equipment from './equipment';
import style from './style.module.css';
import useModalStore from '@src/entities/store/modal';

const Indoor = ({ idB }) => {
  //   Правая боковая панель
  const bCard = useInputStore((s) => s?.input?.bCard?.[idB]);
  const rSide = bCard?.sidesect;
  // Открыть модальное окно
  const openModal = useModalStore((s) => s.open);

  if (!rSide) return <></>;
  const modalProps = { idB };

  return (
    <aside className={style.indoor}>
      <span className={style.indoor__title}>Работа склада</span>
      <Toggle2
        value={rSide.start}
        on1={() => {
          openModal('turnoff', modalProps);
        }}
        on2={() => {
          openModal('turnon', modalProps);
        }}
        disabled={false}
        trigger={[rSide.start]}
      />
      <span className={style.indoor__title}>Данные склада</span>
      <Status data={bCard} />

      <Sensor data={rSide} />

      <span className={`${style.indoor__title} ${style.grey}`}>
        Оборудование
      </span>
      <Equipment data={rSide?.equipment} />
    </aside>
  );
};

export default Indoor;
