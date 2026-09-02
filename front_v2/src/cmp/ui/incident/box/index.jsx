import style from './style.module.css';
import iconIncident from '@tool/dict/icon_incident';

function IncidentBox({ err = {} }) {
  let cls = `${style.container}`;
  if (err?.typeIncident) cls += ` ${style?.[err?.typeIncident]}`;
console.log(123,cls)
  return (
    <div className={cls}>
      <div className={style.content}>
        <img width="40px" height="40px" src={iconIncident?.[err?.code]} />
        <div className={style.msg}>{err?.msg ?? ''}</div>
      </div>
      <span className={style.date}>{err?.date ?? ''}</span>
    </div>
  );
}

export default IncidentBox;
