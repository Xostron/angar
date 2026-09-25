import useInputStore from '@src/entities/store/input';
import style from './style.module.css';
import SummaryTprd from './summary_tprd';
import ChartTprd from '@src/widgets/chart_tprd/charts';

function TprdChart({ idB, idS }) {
  //   const data = useInputStore((s) => s?.input?.innerSec?.[idB]?.[idS]);
  //   console.log(1, data);
  return (
    <section className={style.container}>
      <span>Температура продукта</span>
      <SummaryTprd idB={idB} idS={idS} />
      <ChartTprd />
    </section>
  );
}

export default TprdChart;
