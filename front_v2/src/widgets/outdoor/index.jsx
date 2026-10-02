import TextSens from '@src/shared/ui/text/sensor';
import style from './style.module.css';
import WeatherRow from '@src/entities/weather_row';
import useInputStore from '@src/entities/store/input';
import { useParams } from 'react-router-dom';

const Outdoor = () => {
  const { buildingId: idB } = useParams();
  const bSide = useInputStore((s) => s?.input?.bSide);
  const typeBld = useInputStore((s) => s?.input?.bCard?.[idB]?.type);

  if (!bSide || typeBld == 'cold')
    return (
      <aside className={style.container} style={{ height: '390px' }}></aside>
    );

  return (
    <aside className={style.container}>
      <span className={style.outdoor__title}>Уличные датчики</span>
      {bSide.sensor.map((el) => (
        <TextSens
          key={el.code}
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
    </aside>
  );
};

export default Outdoor;
