import style from './style.module.css';

function IncidentInline({ msg, size = 'responsive' }) {
  if (!msg) return <></>;
  return (
    <div className={style.container} style={dictSize?.[size] ?? {}}>
      {msg}
    </div>
  );
}

export default IncidentInline;

const dictSize = {
  normal: { width: '297px' },
  responsive: { width: '100%' },
};
