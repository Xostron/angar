import CountAlr from '@src/shared/ui/icon/count_alr';
import TypeBld from '@src/shared/ui/icon/type_bld';
import style from './style.module.css';

function HeadBcard({ data }) {
  const { type, start, countAlr, code, name, mode } = data;
  return (
    <div className={style.container}>
      <div className={style.building}>
        <TypeBld type={type} start={start} />
        <div className={style.content}>
          <span className={style.name}>{name} ультра профессионал макс 8</span>
          <span className={style.code}>{code}</span>
        </div>
      </div>
      <div className={style.count}>
        <CountAlr num={countAlr} />
        <span>{mode}</span>
      </div>
    </div>
  );
}

export default HeadBcard;
