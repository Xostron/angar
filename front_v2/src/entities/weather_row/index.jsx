import dictIcon from '@src/shared/dict/icon_indicator';
import style from './style.module.css';
import dictUnit from '@src/shared/dict/unit';
import iconWeather from '@shared/dict/icon_weather';
/**
 * Текст: отображение датчика
 * @param {*} name Название
 * @param {*} value Значение
 * @param {*} state Состояние датчика: on - ОК, off - выведен из работы, alarm - неисправность
 * @param {*} unit Код/значение едениц измерения
 * @param {*} title Описание поля при наведении курсором
 * @returns
 */
function WeatherRow({ temp, hum, code, date, size, title, onClick }) {
  // Курсор, Размеры
  let stl = { cursor: onClick ? 'pointer' : 'auto' };
  stl = { ...stl, ...(dictSize?.[size] ?? {}) };

  // Температура
  const sign = temp > 0 ? '+' : '';
  let t = sign + (temp ?? '') + ' ' + dictUnit.grad;
  //   Влажность
  let h = hum + ' %';
  
  //   Иконка состояние погоды
  const imgWeather = iconWeather?.[code] ? (
    <img width="20px" height="20px" src={iconWeather?.[code]} alt="" />
  ) : null;

  return (
    <div
      className={`${style.text}`}
      title={title}
      style={stl}
      onClick={onClick ? onClick : null}
    >
      {typeof temp == 'number' && typeof hum == 'number' ? (
        <>
          {imgWeather}
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
