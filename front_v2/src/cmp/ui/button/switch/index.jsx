import style from './style.module.css';

//Компонент свитч для переключения ВКЛ/Выкл
function Switch({ value, onChange, disabled = false }) {
  return (
    <label className={`${style.switch} ${disabled ? style.disabled : ''}`}>
      <input
        type="checkbox"
        checked={!!value}
        onChange={onChange}
        disabled={disabled}
      />
      <span className={style.slider} />
    </label>
  );
}

export default Switch;
