import './style.css';

function TogBtn2({
  data = [], // Массив объектов типа [{ value: '1', label: 'Опция 1' }, ...]
  cur, // Текущее активное значение (строка или число)
  action, // Функция коллбэк, вызываемая при клике: (value) => {}
  disabled = false,
  variant = 2, // Стилистический вариант (2 или 3)
}) {
  const style = {
    cursor: disabled ? 'not-allowed' : 'pointer',
    ...dict[variant],
  };

  return (
    <div
      className={`wrapper ${disabled ? 'disabled' : ''} ${variant === 3 ? 'variant3' : ''}`}
    >
      {data.map((opt) => {
        const isActive = opt.value === cur;

        return (
          <button
            key={opt.value} // Обязательный key для React
            className={`tbtn ${isActive ? 'active' : ''}`}
            onClick={() => !disabled && action(opt.value)}
            style={{
              ...style,
              backgroundColor: isActive ? '' : 'transparent',
            }}
            disabled={disabled}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

const dict = {
  2: { width: '133px', height: '47px' },
  3: { width: '100%', height: '47px' },
};

export default TogBtn2;
