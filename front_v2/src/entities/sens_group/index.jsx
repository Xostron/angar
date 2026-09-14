import SensIc from '@src/shared/ui/text/sensor_icon';
import FanCombiIcText from '../fan_icon';
import style from './style.module.css';

function SensGroup({ sensor = [] }) {
  if (!sensor.length) return <></>;
  return (
    <div className={style.container}>
      {sensor.map((el, i) =>
        el.unit ? (
          <SensIc
            key={i}
            code={el.code}
            value={el.value}
            unit={el.unit}
            state={el.state}
          />
        ) : (
          <FanCombiIcText key={i} data={el} />
        ),
      )}
    </div>
  );
}

export default SensGroup;
