import './style.css';

/**
 * Кнопка с текстом
 * @param {*} param0
 * @returns
 */
function Button({
  label,
  onClick,
  disabled = false,
  variant = 'primary',
  type = 'simp',
}) {
  const style = { cursor: disabled ? 'not-allowed' : 'pointer', ...dict[type] };
  //   primary/secondary
  const stl = `btn ${variant}`;

  return (
    <button className={stl} onClick={onClick} disabled={disabled} style={style}>
      {label}
    </button>
  );
}

export default Button;

const dict = {
  simp: {
    padding: '24px 40px',
    width: '187px',
    height: '76px',
    fontWeight: 600,
    fontSize: '20px',
  },
  mode: {
    padding: '22px 88px',
    width: '256px',
    height: '75px',
    fontWeight: 500,
    fontSize: '22px',
  },
  sect: {
    padding: '14px 16px',
    width: '120px',
    height: '56px',
    fontWeight: 500,
    fontSize: '20px',
  },
};
