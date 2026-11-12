import dictUnit from '@src/shared/dict/unit';
import style from './style.module.css';

function TargetTag({ value, unit, imgOff = false }) {
  const stl = imgOff ? { padding: '4px 8px', minWidth: '65px' } : {};
  return (
    <div className={style.target} style={stl}>
      {!imgOff ? (
        <img
          width="24px"
          height="24px"
          src="/icon/indicator/target.svg"
          alt=""
        />
      ) : (
        <></>
      )}
      <span>
        {value ?? '--'} {dictUnit?.[unit] ?? unit}
      </span>
    </div>
  );
}

export default TargetTag;
