import style from './style.module.css';

function InputNum({
  value,
  onChange,
  placeholder,
  disabled,
  readOnly,
  min,
  max,
  title,
  variant = 'normal',
}) {
  return (
    <input
      className={`${style.input}`}
      type="number"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      min={min}
      max={max}
      title={title}
      style={dict?.[variant]}
    />
  );
}

export default InputNum;

const dict = {
  normal: {
    width: '412px',
    height: '52px',
  },
};
