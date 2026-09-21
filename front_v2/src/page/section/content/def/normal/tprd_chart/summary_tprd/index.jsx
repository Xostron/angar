import useInputStore from '@src/entities/store/input';
import style from './style.module.css';
import TargetTag from '@src/shared/ui/tag/target';

function SummaryTprd({ idB, idS }) {
  const tprd = useInputStore((s) => s?.input?.innerSec?.[idB]?.[idS]?.tprd);
  //   console.log(12, tprd);
  return (
    <div className={style.container}>
      <span className={style.min}>min {tprd.min}°</span>
      <span className={style.max}>max {tprd.max}°</span>
      <TargetTag value={tprd?.target} unit={tprd?.unit} />
    </div>
  );
}

export default SummaryTprd;
