import Progress from './progress';
import style from './style.module.css';

function Valve({ data }) {
  return (
    <div className={style.container}>
      <div className={style.name}>
        {/* Прогресс */}
        <Progress value={data.value} />
        <span>{data.name}</span>
      </div>
      <span>{data.value}%</span>
    </div>
  );
}
export default Valve;
