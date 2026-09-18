import useInputStore from '@src/entities/store/input';
import style from './style.module.css';
import FanCard from '@src/entities/fan_card';

function FanCardGroup({ idB, idS }) {
  const fan = useInputStore((s) => s?.input?.innerSec?.[idB]?.[idS]?.fan);
  return (
    <section className={style.container}>
      <span>Вентиляция</span>
      <div className={style.content}>
        {!!fan?.length &&
          fan.map((el) => <FanCard data={el} action={() => {}} />)}
      </div>
    </section>
  );
}

export default FanCardGroup;
