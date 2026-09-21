import dictFan from '@src/shared/dict/fan_card';
import style from './style.module.css';

function FanCard({ data, action }) {
  const icon = getIcon(data?.state);
  const cls = `${style.container} ${data.state == 'alarm' ? style.alarm : ''}`;

  return (
    <div
      className={cls}
      onClick={() => {
        action();
      }}
    >
      <img
        className={`${style.fan} ${data.state == 'run' ? style.run : ''}`}
        src={dictFan?.[data.state]}
        alt=""
      />
      {typeof data.value == 'number' && <span>{data.value}%</span>}
      <img
        width="18px"
        height="18px"
        className={style.setting}
        src={icon}
        alt=""
      />
    </div>
  );
}

export default FanCard;

function getIcon(state) {
  if (state != 'alarm') return '/icon/indicator/setting.svg';
  return '/icon/indicator/crash.svg';
}
