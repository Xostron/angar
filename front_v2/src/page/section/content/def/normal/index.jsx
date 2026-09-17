import useInputStore from '@src/entities/store/input';
import style from './style.module.css';
import Header from './header';
import Sensors from './sensors';

function Section({ idB, idS }) {
  const data = useInputStore((s) => s?.input?.innerSec?.[idB]?.[idS]);
  //   console.log(1, data);
  return (
    <section className={style.container}>
      <Header idB={idB} idS={idS} />
      <Sensors idB={idB} idS={idS} />
    </section>
  );
}

export default Section;
