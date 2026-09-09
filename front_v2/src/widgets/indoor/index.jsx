import Toggle2 from '@src/shared/ui/button/toggle_button_2';
import TextSensRow from '@src/shared/ui/text/sensor_row';
import useInputStore from '@src/entities/store/input';
import style from './style.module.css';
import { Sensor, Status } from './row';
import Equipment from './equipment';

const Indoor = ({ idB }) => {
  //   Правая боковая панель
  const bCard = useInputStore((s) => s?.input?.bCard?.[idB]);
  const rSide = bCard?.sidesect;
  console.log(1, rSide, bCard);
  if (!rSide) return <></>;

  return (
    <aside className={style.indoor}>
      <span className={style.indoor__title}>Работа склада</span>
      <Toggle2
        value={rSide.start}
        on1={() => {}}
        on2={() => {}}
        disabled={false}
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
