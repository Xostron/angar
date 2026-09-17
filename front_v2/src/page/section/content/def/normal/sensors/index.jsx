import useInputStore from '@src/entities/store/input';
import style from './style.module.css';
import Block from './block';

function Sensors({ idB, idS }) {
  const data = useInputStore((s) => s?.input?.innerSec?.[idB]?.[idS]);

  return (
    <div className={style.container}>
      <span>Датчики секции</span>
      <div className={style.sensors}>
        {data.sensor && data.sensor.map((el) => <Block data={el} />)}
      </div>
    </div>
  );
}

export default Sensors;
