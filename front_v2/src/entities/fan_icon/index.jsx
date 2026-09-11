import style from './style.module.css';
import dictFanScard from '@src/shared/dict/fan_scard';

function FanCombiIcText({ data }) {
  if (!Object.keys(data ?? {}).length) return <></>;

  return (
    <div className={style.container}>
      <img
        width="32px"
        height="32px"
        src={`${dictFanScard?.[data.code]}??''`}
        alt=""
      />
      <span>{data.value.toLowerCase()}</span>
    </div>
  );
}

export default FanCombiIcText;
