import style from './style.module.css';
import iconIncident from '@tool/dict/icon_incident';

function IncidentBox({ err = {}, size = 'normal' }) {
  // Размеры
  const stl = { ...(dictSize?.[size] ?? {}) };

  // Цвет: typeIncident = equipment|notification|alarm
  let cls = `${style.container}`;
  if (err?.typeIncident) cls += ` ${style?.[err?.typeIncident] ?? ''}`;

  return (
    <div className={cls} style={stl}>
      <div className={style.content}>
        <img src={iconIncident?.[err?.code]} />
        <div className={style.msg}>{err?.msg ?? ''}</div>
      </div>
      <span className={style.date}>{err?.date ?? ''}</span>
    </div>
  );
}

const dictSize = {
  normal: {
    width: '297px',
  },
};

export default IncidentBox;
