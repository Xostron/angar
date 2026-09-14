import { Link } from 'react-router-dom';
import style from './style.module.css';
import SensGroup from '@src/entities/sens_group'
import ValveGroup from '@src/entities/valve_group'

// Для комби склада: Карточка секции
function ScardCombi({ data }) {
  const { idS, idB, order, name, mode, clrMode, sensor, valve } = data;
  // console.log(12, data)
  return (
    <Link className={style.container} to={`section/${idS}`}>
      {/* Заголовок */}
      <div className={style.name_mode}>
        <span>{name}</span>
        <span className={style.mode}>{mode}</span>
      </div>
      {/* Режим ТО */}
      <div className={style.clr_mode}>
        <span>Режим ТО</span>
        <span className={style.cmode}>{clrMode}</span>
      </div>

      {/* ВНО и датчики */}
      <SensGroup sensor={sensor} />
      {/* Клапаны */}
      <ValveGroup valve={valve} />
    </Link>
  );
}


export default ScardCombi;
