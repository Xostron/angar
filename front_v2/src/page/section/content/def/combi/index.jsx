import useInputStore from '@src/entities/store/input';
import style from './style.module.css';
import Header from '../normal/header';
import Sensors from '../normal/sensors';
import ValveCardGroup from '../normal/valve_card_group';
import FanCardGroup from '../normal/fan_card_group';
import TprdChart from '../normal/tprd_chart';
import DefCircuit from './circuit';

function Section({ idB, idS }) {
  return (
    <section className={style.container}>
      <Header idB={idB} idS={idS} />
      <Sensors idB={idB} idS={idS} />
      <div className={style.circuit}>
        <DefCircuit idB={idB} idS={idS} />
        <TprdChart idB={idB} idS={idS} />
      </div>
      <ValveCardGroup idB={idB} idS={idS} />
      <FanCardGroup idB={idB} idS={idS} typeBld="combi" />
    </section>
  );
}

export default Section;
