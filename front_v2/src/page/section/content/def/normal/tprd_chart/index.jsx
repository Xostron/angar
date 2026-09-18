import useInputStore from '@src/entities/store/input';
import style from './style.module.css';

function TprdChart({ idB, idS }) {
  const data = useInputStore((s) => s?.input?.innerSec?.[idB]?.[idS]);
  //   console.log(1, data);
  return (
    <section className={style.container}>

    </section>
  );
}

export default TprdChart;
