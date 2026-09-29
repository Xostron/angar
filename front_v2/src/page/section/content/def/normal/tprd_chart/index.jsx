import useInputStore from '@src/entities/store/input';
import style from './style.module.css';
import SummaryTprd from './summary_tprd';
import ChartTprd from '@src/widgets/chart_tprd';

function TprdChart({ idB, idS }) {
  return (
    <section className={style.container}>
      <span>Температура продукта</span>
      <SummaryTprd idB={idB} idS={idS} />
      <ChartTprd stl={{ height: '280px' }} />
    </section>
  );
}

export default TprdChart;
