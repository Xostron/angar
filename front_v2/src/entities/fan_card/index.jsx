import dictFan from '@src/shared/dict/fan_card';
import style from './style.module.css';

function FanCard({ data, action }) {
  console.log(12, data);
  const icon = getIcon(data?.state);
  return (
    <div
      className={style.container}
      onClick={() => {
        action();
      }}
    >
      <img className={style.fan} src={dictFan?.[data.state]} alt="" />
      {typeof data.value == 'number' && <span>{data.value}%</span>}
      <img
        {...icon}
        // width="18px"
        // height="18px"
        className={style.setting}
        // src={icon}
        alt=""
      />
    </div>
  );
}

export default FanCard;

function getIcon(state) {
  if (state != 'alarm')
    return {
      src: '/icon/indicator/setting.svg',
      width: '18px',
      height: '18px',
    };
  return { src: '/icon/indicator/crash.svg', width: '18px', height: '18px' };
}
