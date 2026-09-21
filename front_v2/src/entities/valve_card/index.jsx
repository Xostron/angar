import Progress from '@src/shared/ui/progress_valve';
import style from './style.module.css';

function ValveCard({ data, action }) {
  return (
    <div className={style.container}>
      <Progress width={74} value={data?.value} heat={false} mode="number" />

      <div className={style.content}>
        <div className={style.name_status}>
          <div className={style.name}>
            {data.name}
            {data.heat && <img src="/icon/indicator/heat.svg" alt="" />}
          </div>
          <span className={style.status}>
            {dictValve?.[data.state] ?? '--'}
          </span>
        </div>
        <div
          className={style.img}
          onClick={() => {
            action();
          }}
        >
          <img src="/icon/indicator/next2.svg" />
        </div>
      </div>
    </div>
  );
}

export default ValveCard;

const dictValve = {
  opn: 'Открыт',
  cls: 'Закрыт',
  iopn: 'Открывается',
  icls: 'Закрывается',
  alarm: 'Авария',
};
