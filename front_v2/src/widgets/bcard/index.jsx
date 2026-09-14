import { Link } from 'react-router-dom';
import TextIcEquip from '@src/shared/ui/text/equipment_icon';
import IncidentInline from '@src/shared/ui/incident/inline';
import TextSensRow from '@src/shared/ui/text/sensor_row';
import HeadBcard from './head_bcard';
import SensGroup from '../../entities/sens_group';
import style from './style.module.css';

/**
 * Карточка склада
 * @param {*} data Данные из Zustand о складе input.bCard
 * @returns
 */
const Bcard = ({ data }) => {
  return (
    <Link className={style.container} to={`/building/${data.idB}`}>
      <HeadBcard data={data} />

      <TextSensRow name="Продукт" value={data?.product?.name} />

      <TextSensRow name="Режим" value={data?.automode?.name} />

      <TextIcEquip name="Вентиляция" value={data?.fan} />

      <SensGroup sensor={data.sensor} />

      <IncidentInline msg={data?.achieve?.[0]?.msg} />
    </Link>
  );
};

export default Bcard;
