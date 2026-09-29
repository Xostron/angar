import dictEquipment from '@src/shared/dict/equipment';
import style from './style.module.css';
import dictUnit from '@src/shared/dict/unit';

/**
 * Статус оборудования: иконка + текст статуса
 * @param {*} code код иконки
 * @returns
 */
export default function EquipSt({ code, data, unit = '' }) {
  return (
    <div
      className={`${style.container} ${data.state == 'alarm' ? style.alarm : ''}`}
    >
      <img src={dictEquipment?.[code]} alt={code} />
      <span className={style.value}>
        {data?.value} {dictUnit?.[unit] ?? unit}
      </span>
    </div>
  );
}
