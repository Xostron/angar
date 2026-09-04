import dictIcon from '@src/shared/dict/icon_indicator';
import style from './style.module.css';

function IncidentInline({ msg, size = 'normal' }) {
  return (
    <div className={style.container} style={dictSize?.[size] ?? {}}>
      {msg}
    </div>
  );
}

export default IncidentInline;

const dictSize = {
  normal: { width: '297px' },
  large: { width: '362px' },
};
