import dictIcon from '@tool/dict/icon_indicator';
import style from './style.module.css';
import dictUnit from '@tool/dict/unit';
/**
 * Текст: отображение датчика
 * @param {*} name Название
 * @param {*} value Значение
 * @param {*} state Состояние датчика: on - ОК, off - выведен из работы, alarm - неисправность
 * @param {*} unit Код/значение едениц измерения
 * @param {*} title Описание поля при наведении курсором
 * @returns
 */
function TextSens({ name, value, state, size, unit = 'grad', title }) {
  // Размеры
  const stl = dictSize?.[size] ?? {};

  // Значение
  const sign = unit == 'grad' && value > 0 ? '+' : '';
  let content = '';
  if (value !== undefined && value !== null)
    content = sign + (value ?? '') + ' ' + (dictUnit?.[unit] ?? unit ?? '');

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
      <span className={style.name}>{name}</span>
      <span className={style.value}>{content}</span>
    </div>
  );
}

// Размеры
const dictSize = {};

export default TextSens;
