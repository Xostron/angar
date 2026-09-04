import dictIcon from '@src/shared/dict/icon_indicator';
import dictValue from '@src/shared/dict/value';
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
function TextEquip({ name, value, state, size, title }) {
  // Размеры
  const stl = dictSize?.[size] ?? {};

  // Значение
  let content = dictValue?.[value] ?? value ?? '';

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

  //   Стиль значения
  const clsValue = content === 'выкл' ? style.voff : '';

  return (
    <div className={`${style.text} ${cls} `} title={title} style={stl}>
      <span className={style.name}>{name}</span>
      <span className={`${style.value} ${clsValue}`}>{content}</span>
    </div>
  );
}

// Размеры
const dictSize = {};

export default TextEquip;
