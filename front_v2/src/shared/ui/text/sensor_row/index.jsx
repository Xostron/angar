import dictIcon from '@src/shared/dict/icon_indicator';
import style from './style.module.css';
import dictUnit from '@src/shared/dict/unit';
/**
 * Текст: отображение датчика
 * @param {*} name Название
 * @param {*} value Значение
 * @param {*} state Состояние датчика: on - ОК, off - выведен из работы, alarm - неисправность
 * @param {*} unit Код/значение едениц измерения
 * @param {*} title Описание поля при наведении курсором
 * @returns
 */
function TextSensRow({ name, value, state, size, unit, title, info }) {
  // Размеры
  const stl = dictSize?.[size] ?? {};

  // Значение
  const sign = unit == 'grad' && value > 0 ? '+' : '';
  let content = sign + (value ?? '') + ' ' + (dictUnit?.[unit] ?? unit ?? '');

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
      <div className={style.name}>
        <span>{name}</span>
        {info && <img src={dictIcon.info} />}
      </div>
      <span className={style.value}>{content}</span>
    </div>
  );
}

// Размеры
const dictSize = {};

export default TextSensRow;
