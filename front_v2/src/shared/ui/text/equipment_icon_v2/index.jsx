import dictIcon from '@src/shared/dict/icon_indicator';
import dictValue from '@src/shared/dict/value';
import style from './style.module.css';
import dictEquipment from '@src/shared/dict/equipment';
/**
 * Текст: отображение датчика
 * @param {*} name Название
 * @param {*} value Значение
 * @param {*} state Состояние датчика: on - ОК, off - выведен из работы, alarm - неисправность
 * @param {*} unit Код/значение едениц измерения
 * @param {*} title Описание поля при наведении курсором
 * @returns
 */
function TextIcEquipV2({
  code = '',
  name,
  value,
  state,
  size = 'responsive',
  title,
  transparent,
}) {
  // Размеры
  const stl = dictSize?.[size] ?? {};

  // Значение
  const stt = dictValue?.[state] ?? state ?? '';

  // Стили: выведен из работы/неисправность
  let cls = '',
    clsValue = '';
  if (state == 'off') {
    cls = style.off;
    clsValue = style.voff;
  }
  if (state == 'alarm') {
    cls = style.alarm;
  }

  //   Стиль значения

  return (
    <div
      className={`${style.container} ${cls} ${transparent ? style.transparent : ''}`}
      title={title}
      style={stl}
    >
      <div className={style.name}>
        <img
          width="24px"
          height="24px"
          src={`${dictEquipment[code + '_' + state]}`}
        />
        <span>{name}</span>
      </div>
      <div className={`${style.value} ${clsValue}`}>
        {stt} {value}%
        <img
          className={style.next}
          width="24px"
          height="24px"
          src={`/icon/indicator/next2.svg`}
        />
      </div>
    </div>
  );
}

// Размеры
const dictSize = {
  normal: { width: '274px' },
  responsive: { width: '100%' },
};

export default TextIcEquipV2;
