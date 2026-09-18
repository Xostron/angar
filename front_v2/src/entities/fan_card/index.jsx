import dictFan from '@src/shared/dict/fan_card';
import style from './style.module.css';

function FanCard({ data, action }) {
  return (
    <div
      className={style.container}
      onClick={() => {
        action();
      }}
    >
      <img className={style.fan} src={dictFan?.[data.state]} alt="" />
      {typeof data.value == 'number' && <span>{data.value}%</span>}
      <img className={style.setting} src="/icon/indicator/setting.svg" alt="" />
    </div>
  );
}

export default FanCard;
