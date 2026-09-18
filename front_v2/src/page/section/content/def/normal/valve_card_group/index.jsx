import useInputStore from '@src/entities/store/input';
import ValveCard from '@src/entities/valve_card';
import style from './style.module.css';

function ValveCardGroup({ idB, idS }) {
  const valve = useInputStore((s) => s?.input?.innerSec?.[idB]?.[idS]?.valve);
  return (
    <section className={style.container}>
      <span>Клапана</span>
      <div className={style.content}>
        {!!valve?.length && valve.map((el) => <ValveCard data={el} />)}
      </div>
    </section>
  );
}

export default ValveCardGroup;
