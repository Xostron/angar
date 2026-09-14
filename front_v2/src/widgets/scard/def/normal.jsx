import { Link } from 'react-router-dom';
import style from './style.module.css';
import SensGroup from '@src/entities/sens_group'
import TextIcEquip from '@src/shared/ui/text/equipment_icon'
import ValveGroup from '@src/entities/valve_group'

// Для обычного склада: Карточка секции
function ScardNormal({ data }) {
  const { idS, idB, order, name, mode, fan, sensor, valve } = data;
  // console.log(12, data)
  return (
    <Link className={style.container} to={`section/${idS}`}>
      {/* Заголовок */}
      <div className={style.name_mode}>
        <span>{name}</span>
        <span className={style.mode}>{mode}</span>
      </div>
      {/* Датчики */}
      <SensGroup sensor={sensor} />
      {/* ВНО */}
      <TextIcEquip name="Вентиляция" value={data?.fan} />
      {/* Клапаны */}
      <ValveGroup valve={valve} />
    </Link>
  );
}

export default ScardNormal;
