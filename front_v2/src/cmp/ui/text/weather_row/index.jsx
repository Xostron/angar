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
function WeatherRow({ temp, hum, type = 'sun', date, size, title, onClick }) {
  // Курсор, Размеры
  let stl = { cursor: onClick ? 'pointer' : 'auto' };
  stl = { ...stl, ...(dictSize?.[size] ?? {}) };

  // Температура
  const sign = temp > 0 ? '+' : '';
  let t = sign + (temp ?? '') + ' ' + dictUnit.grad;
  //   Влажность
  let h = hum + ' %';

  return (
    <div
      className={`${style.text}`}
      title={title}
      style={stl}
      onClick={onClick ? onClick : null}
    >
      {typeof temp == 'number' && typeof hum == 'number' ? (
        <>
          {dictIcon?.[type] && <img width="20px" src={dictIcon?.[type]} />}
          <span className={style.temp}>{t}</span>|
          <span className={style.hum}>{h}</span>
          <img width="16px" src={dictIcon.updSmall} />
          <span>{date}</span>
          <img width="24px" src={dictIcon.next} />
        </>
      ) : (
        'Данные недоступны'
      )}
    </div>
  );
}

// Размеры
const dictSize = {};

export default WeatherRow;
