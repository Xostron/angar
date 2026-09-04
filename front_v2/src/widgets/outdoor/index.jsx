import TextSens from '@src/shared/ui/text/sensor';
import style from './style.module.css';
import WeatherRow from '@src/entities/weather_row';
import useInputStore from '@src/entities/store/input';

const Outdoor = () => {
  const bSide = useInputStore((s) => s?.input?.bSide);
  if (!bSide) return;
  return (
    <div className={style.outdoor}>
      <span className={style.outdoor__title}>Уличные датчики</span>
      {bSide.sensor.map((el) => (
        <TextSens
          name={el.name}
          value={el.value}
          state={el.state}
          unit={el.unit}
        />
      ))}

      <WeatherRow
        weather={bSide.weather}
        title={bSide.weather.name}
        onClick={() => {}}
      />
    </div>
  );
};

export default Outdoor;
