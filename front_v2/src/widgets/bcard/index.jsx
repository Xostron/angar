import { Link } from 'react-router-dom';
import TextIcEquip from '@src/shared/ui/text/equipment_icon';
import IncidentInline from '@src/shared/ui/incident/inline';
import TextSensRow from '@src/shared/ui/text/sensor_row';
import HeadBcard from './head_bcard';
import SensGroup from './sens_group';
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

// {
//     "order": 1,
//     "name": "Комби",
//     "type": "combi",
//     "code": "2026-2",
//     "countAlr": 0,
//     "mode": "Авто",
//     "product": {
//         "_id": "66d0886536e7e1b1ff9e0788",
//         "name": "Лук",
//         "code": "onion"
//     },
//     "automode": {
//         "code": "drying",
//         "name": "Сушка"
//     },
//     "fan": "Вкл",
//     "tprd": {
//         "state": "on",
//         "max": 22,
//         "min": 21
//     },
//     "hin": {
//         "state": "on",
//         "value": 75
//     },
//     "achieve": [
//         {
//             "order": 2,
//             "code": "drying3",
//             "msg": " t задания канала = 20 °С, t задания продукта = 21 °С",
//             "title": "",
//             "buildingId": "69f9dd09c35ea05200898cd8",
//             "uid": "fce897fd-e719-49a3-a748-eec3f45969b7",
//             "date": "04.09.2026, 16:37:45"
//         }
//     ],
//     "sidesect": {
//         "start": true,
//         "tprd": 21,
//         "hin": 75,
//         "habsin": 13.7,
//         "co2": 21,
//         "extra": []
//     }
// }
