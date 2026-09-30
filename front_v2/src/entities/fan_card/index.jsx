import dictFan from '@src/shared/dict/fan_card';
import style from './style.module.css';

function FanCard({ data, action, size = 'onerow', fc }) {
  const icon = getIcon(data?.state);
  if (!data) return;
  let cls = `${style.container}`;
  if (data.state == 'alarm') cls += ` ${style.alarm}`;
  if (data.state == 'off') cls += ` ${style.off}`;
//   console.log(123, size, fc);

  return (
    <div
      className={cls}
      style={fc ? dictSize[size]?.containerFC : dictSize[size]?.container}
      onClick={() => {
        action();
      }}
    >
      <img
        style={dictSize[size]?.img ?? {}}
        className={`${style.fan} ${data.state == 'run' ? style.run : ''}`}
        src={dictFan?.[data.state]}
        alt=""
      />
      {typeof data.value == 'number' && (
        <span>{data.state == 'off' ? '--' : data.value}%</span>
      )}
      {data.state == 'off' ? (
        <></>
      ) : (
        <img
          width="18px"
          height="18px"
          className={style.setting}
          src={icon}
          alt=""
        />
      )}
    </div>
  );
}

export default FanCard;

function getIcon(state) {
  if (state != 'alarm') return '/icon/indicator/setting.svg';
  return '/icon/indicator/crash.svg';
}

const dictSize = {
  // ВНО размером в 1 строку
  onerow: {
    containerFC: {
      width: '188px',
      height: '92px',
      justifyContent: 'center',
      gap: '24px',
    },
    container: {
      width: '188px',
      height: '92px',
      justifyContent: 'center',
      gap: '24px',
    },
    img: { width: '52px', height: '52px' },
  },
  //   ВНО размером в 2 строки:
  tworow: {
    containerFC: {
      width: '134px',
      height: '49px',
      padding: '6.5px 18px 6.5px 16px',
    },
    container: { height: '49px' },
  },
};
