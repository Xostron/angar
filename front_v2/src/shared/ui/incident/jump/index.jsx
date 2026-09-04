import dictIcon from '@src/shared/dict/icon_indicator';
import style from './style.module.css';

function IncidentJump({ count, onClick, size = 'normal' }) {
  if (!count) return <></>;
  return (
    <button
      className={style.button}
      onClick={onClick}
      style={dictSize?.[size] ?? {}}
    >
      Все аварии (+{count})
      <img src={dictIcon.next} alt="" />
    </button>
  );
}

export default IncidentJump;

const dictSize = {
  normal: { width: '297px' },
  large: { width: '362px' },
};
