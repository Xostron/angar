import Progress from '../../shared/ui/progress_valve';
import style from './style.module.css';

function Valve({ data }) {
  return (
    <div className={style.container}>
      <div className={style.name}>
        {/* Прогресс */}
        <Progress value={data.value} heat={data.heat} />
        <span>{data.name}</span>
      </div>
      <span>{data.value}%</span>
    </div>
  );
}
export default Valve;
