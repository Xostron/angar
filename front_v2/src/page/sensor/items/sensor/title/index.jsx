import style from './style.module.css';
import TargetTag from '@src/shared/ui/tag/target';
import Switch from '@src/shared/ui/button/switch';

// Однострочный заголовок
function Title1({ el, value, on, actOn, unit, isAuth }) {
  return (
    <div className={style.title1}>
      <div className={style.block_title}>
        <span>Датчик {el.order}</span>
        <TargetTag value={value} unit={unit} imgOff />
      </div>
      <Switch value={on} onChange={actOn} disabled={!isAuth} />
    </div>
  );
}

// Однострочный заголовок
function Title2({ el, value, on, actOn, unit, isAuth }) {
  return (
    <div className={style.title2}>
      <span>{el.name}</span>
      <div className={style.block_switch}>
        <TargetTag value={value} unit={unit} imgOff />
        <Switch value={on} onChange={actOn} disabled={!isAuth} />
      </div>
    </div>
  );
}

export { Title1, Title2 };
