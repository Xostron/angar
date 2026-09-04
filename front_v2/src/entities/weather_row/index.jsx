import dictIcon from '@src/shared/dict/icon_indicator';
import iconWeather from '@shared/dict/icon_weather';
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
function WeatherRow({ weather, size, title, onClick }) {
  const { temp, hum, update, code } = weather;

  // Курсор, Размеры
  let stl = { cursor: onClick ? 'pointer' : 'auto' };
  stl = { ...stl, ...(dictSize?.[size] ?? {}) };

  // Температура
  const sign = temp > 0 ? '+' : '';
  let t = sign + (temp ?? '') + ' ' + dictUnit.grad;
  //   Дата погоды
  const date = new Date(update).toLocaleDateString('ru-RU');

  //   Иконка состояние погоды
  const imgWeather = iconWeather?.[code] ? (
    <img width="20px" height="20px" src={iconWeather?.[code]} alt="" />
  ) : null;

  if (typeof temp != 'number' || typeof hum != 'number')
    return <span className={`${style.text}`}>Данные недоступны</span>;

  return (
    <section
      className={`${style.text}`}
      title={title}
      style={stl}
      onClick={onClick ? onClick : null}
    >
      {imgWeather}
      <span className={style.temp}>{t}</span>|
      <span className={style.hum}>{hum + ' %'}</span>
      <img width="16px" height="16px" src={dictIcon.updSmall} />
      <span>{date}</span>
      <img width="24px" height="24px" src={dictIcon.next} />
    </section>
  );
}

// Размеры
const dictSize = {};

export default WeatherRow;
