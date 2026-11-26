import Progress from '@src/shared/ui/progress_valve';
import useModalStore from '../store/modal';
import style from './style.module.css';

function ValveCard({ idB, idS, data }) {
  const openModal = useModalStore((s) => s.open);
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
        <div className={style.img} onClick={onClick}>
          <img src="/icon/indicator/next2.svg" />
        </div>
      </div>
    </div>
  );
  function onClick() {
    openModal('valve', { idB, idS, data });
  }
}

export default ValveCard;

const dictValve = {
  opn: 'Открыт',
  cls: 'Закрыт',
  iopn: 'Открывается',
  icls: 'Закрывается',
  alarm: 'Авария',
  popn: 'Приоткрыт',
};
