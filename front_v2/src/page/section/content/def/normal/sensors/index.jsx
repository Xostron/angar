import useInputStore from '@src/entities/store/input';
import Block from './block';
import style from './style.module.css';

function Sensors({ idB, idS }) {
  const sensor = useInputStore((s) => s?.input?.innerSec?.[idB]?.[idS]?.sensor);

  return (
    <div className={style.container}>
      <span>Датчики секции</span>
      <div className={style.content}>
        {!!sensor?.length &&
          sensor.map((el) => <Block key={el.code} data={el} />)}
      </div>
    </div>
  );
}

export default Sensors;
