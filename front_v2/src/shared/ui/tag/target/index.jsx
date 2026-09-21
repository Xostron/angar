import dictUnit from '@src/shared/dict/unit';
import style from './style.module.css';

function TargetTag({ value, unit }) {
  return (
    <div className={style.target}>
      <img width="24px" height="24px" src="/icon/indicator/target.svg" alt="" />
      <span>
        {value ?? '--'} {dictUnit?.[unit] ?? unit}
      </span>
    </div>
  );
}

export default TargetTag;
