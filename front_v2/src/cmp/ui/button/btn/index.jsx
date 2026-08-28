import style from './style.module.css';

/**
 * Кнопка с текстом
 * @param {*} param0
 * @returns
 */
function Button({
  label,
  onClick,
  disabled = false,
  active = true,
  variant = 'usual',
}) {
  const stl = {
    cursor: disabled ? 'not-allowed' : 'pointer',
    ...(dict?.[variant] ?? {}),
  };
  const cls = `${style.btn} ${dictActive?.[variant]?.[active] ?? ''}`;

  return (
    <button className={cls} onClick={onClick} disabled={disabled} style={stl}>
      {label}
    </button>
  );
}

export default Button;

// Тип кнопки
const dict = {
  // Обычная кнопка
  usual: {
    padding: '24px 40px',
    width: '187px',
    height: '76px',
    fontWeight: 600,
  },
  //   Кнопка авторежимы
  automode: {
    padding: '22px 88px',
    width: '256px',
    height: '75px',
    fontSize: '22px',
  },
  //   Кнопка секции
  sect: {
    padding: '14px 16px',
    width: '120px',
    height: '56px',
  },
  //   2х позиционный перключатель
  toggle2: {
    padding: '13.5px 0px',
    width: '50%',
    height: '47px',
    lineHeight: '20px',
    fontSize: '16px',
  },
  //   3х позиционный перключатель
  toggle3: {
    padding: '13.5px 0px',
    width: '50%',
    height: '47px',
    lineHeight: '20px',
    fontSize: '16px',
  },
};

const dictActive = {
  usual: { true: style.active, false: style.not_active },
  automode: { true: style.automode_active, false: style.automode_not_active },
  sect: { true: style.sect_active, false: style.sect_not_active },
  toggle2: { true: style.toggle2_active, false: style.toggle2_not_active },
  toggle3: { true: style.toggle2_active, false: style.toggle2_not_active },
};
