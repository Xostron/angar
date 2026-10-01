import useInputStore from '@src/entities/store/input';
import DefCircuit from '../combi/circuit';
import TprdChart from '../normal/tprd_chart';
import style from './style.module.css';

function Section({ idB, idS }) {
  return (
    <section className={style.container}>
      <div className={style.circuit}>
        <DefCircuit idB={idB} idS={idS} />
        <TprdChart idB={idB} idS={idS} />
      </div>
    </section>
  );
}

export default Section;
