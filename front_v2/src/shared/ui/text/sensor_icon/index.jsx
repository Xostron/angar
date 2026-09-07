import dictIcon from '@src/shared/dict/icon_indicator';
import dictSensor from '@shared/dict/icon_sensor';
import dictUnit from '@src/shared/dict/unit';
import style from './style.module.css';

/**
 * Текст: отображение датчика
 * @param {*} name Название
 * @param {*} value Значение
 * @param {*} state Состояние датчика: on - ОК, off - выведен из работы, alarm - неисправность
 * @param {*} unit Код/значение едениц измерения
 * @param {*} title Описание поля при наведении курсором
 * @returns
 */
function SensIc({ value, state, code, size = '', unit, title, info }) {
  // Размеры
  const stl = dictSize?.[size] ?? {};

  // Значение
  const sign = unit == 'grad' && value > 0 ? '+' : '';
  let content = sign + (value ?? '');

  // Стили: выведен из работы/неисправность
  let cls = '';
  if (state == 'off') {
    cls = style.off;
    content = <img width="24px" src={dictIcon.offline} />;
  }
  if (state == 'alarm') {
    cls = style.alarm;
    content = <img width="24px" src={dictIcon.crash} />;
  }
  return (
    <div className={`${style.text} ${cls} `} title={title} style={stl}>
      {dictSensor?.[code] && <img src={dictSensor?.[code]} alt="" />}
      {info && <img src={dictIcon.info} />}
      <span className={style.value}>{content}</span>
      <span className={style.unit}>{dictUnit?.[unit] ?? unit ?? ''}</span>
    </div>
  );
}

// Размеры
const dictSize = {
  normal: { width: '274px' },
  responsive: { width: '100%' },
};

export default SensIc;
