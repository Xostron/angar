import useInputStore from '@src/entities/store/input';
import FanCard from '@src/entities/fan_card';
import style from './style.module.css';

function FanCardGroup({ idB, idS }) {
  const fan = useInputStore((s) => s?.input?.innerSec?.[idB]?.[idS]?.fan);
  return (
    <section className={style.container}>
      <span>Вентиляция</span>
      <div className={style.content}>
        {!!fan?.length &&
          fan.map((el) => <FanCard key={el._id} data={el} action={() => {}} />)}
      </div>
    </section>
  );
}

export default FanCardGroup;
