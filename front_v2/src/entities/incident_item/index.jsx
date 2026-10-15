import style from './style.module.css';
import iconIncident from '@src/shared/dict/icon_incident';

function IncidentItem({ data = {} }) {
  if (!data?.msg) return <></>;

  let cls = `${style.container}`;

  return (
    <div className={cls}>
      <img
        src={iconIncident?.[data?.code] ?? iconIncident?.[data?.order]}
        alt={data?.code}
      />
      <span className={style.msg}>
        {data?.title ?? ''} {data?.msg ?? ''}
      </span>
      <span className={style.date}>{data?.date ?? ''}</span>
    </div>
  );
}

export default IncidentItem;
