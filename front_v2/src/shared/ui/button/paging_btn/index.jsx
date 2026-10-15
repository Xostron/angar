import style from './style.module.css';

/**
 * Кнопка с текстом
 * @param {*} param0
 * @returns
 */
function PageButton({
  label,
  onClick,
  disabled = false,
  variant = 'back', //back, next
}) {
  const stl = {
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    ...(dict?.[variant] ?? {}),
  };
  let cls = `${style.btn} ${style[variant]}`;

  return (
    <button className={cls} onClick={onClick} disabled={disabled} style={stl}>
      {fnContent(variant, label)}
    </button>
  );
}

export default PageButton;

function fnContent(variant, label) {
  return variant == 'back' ? (
    <>
      <img
        className={style.img_back}
        width="24px"
        height="24px"
        src={`/icon/indicator/next2.svg`}
      />
      <span>{label}</span>
    </>
  ) : (
    <>
      <span>{label}</span>
      <img
        className={style.img_next}
        width="24px"
        height="24px"
        src={`/icon/indicator/next2.svg`}
      />
    </>
  );
}

// Тип кнопки
const dict = {
  next: {
    padding: '20.5px 40.5px',
    width: '172px',
    height: '69px',
    fontWeight: 600,
  },
  back: {
    padding: '20.5px 40.5px',
    width: '172px',
    height: '69px',
    fontWeight: 600,
  },
};

const dictActive = {
  next: { true: style.active, false: style.not_active },
  back: { true: style.active, false: style.not_active },
};
