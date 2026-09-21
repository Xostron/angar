import useInputStore from '@src/entities/store/input';
import style from './style.module.css';
import Header from './header';
import Sensors from './sensors';
import TprdChart from './tprd_chart';
import ValveCardGroup from './valve_card_group';
import FanCardGroup from './fan_card_group';

function Section({ idB, idS }) {
  const data = useInputStore((s) => s?.input?.innerSec?.[idB]?.[idS]);
//   console.log(1, data);
  return (
    <section className={style.container}>
      <Header idB={idB} idS={idS} />
      <Sensors idB={idB} idS={idS} />
      <TprdChart idB={idB} idS={idS} />
      <ValveCardGroup idB={idB} idS={idS} />
      <FanCardGroup idB={idB} idS={idS} />
    </section>
  );
}

export default Section;
