import SensIc from '@src/shared/ui/text/sensor_icon';
import style from './style.module.css';

function SensGroup({ sensor = [] }) {
  if (!sensor.length) return <></>;
  return (
    <div className={style.container}>
      {sensor.map((el) => (
        <SensIc
          key={el.code}
          code={el.code}
          value={el.value}
          unit={el.unit}
          state={el.state}
        />
      ))}
    </div>
  );
}

export default SensGroup;
