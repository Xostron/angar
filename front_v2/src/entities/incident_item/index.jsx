import style from './style.module.css';
import iconIncident from '@src/shared/dict/icon_incident';

function IncidentItem({ data = {}, type = 'alarm', size = 'normal' }) {
  if (!data?.msg) return <></>;
  // Размеры
  //   const stl = { ...(dictSize?.[size] ?? {}) };

  // Цвет: typeIncident = equipment|notification|alarm
  let cls = `${style.container}`;
  //   if (type) cls += ` ${style?.[type] ?? ''}`;

  return (
    <div className={cls}>
      <img src={iconIncident?.[data?.code] ?? iconIncident?.[data?.order]} alt={data?.code}/>
      <span className={style.msg}>
        {data?.title ?? ''} {data?.msg ?? ''}
      </span>
      <span className={style.date}>{data?.date ?? ''}</span>
    </div>
  );
}

const dictSize = {
  normal: {
    width: '297px',
  },
};

export default IncidentItem;
