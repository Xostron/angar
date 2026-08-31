import { useRef, useState } from 'react';
import style from './style.module.css';

function InputNum({
  value,
  setValue,
  placeholder,
  disabled,
  readOnly,
  min = -99999,
  max = 99999,
  title,
  variant = 'normal',
  defaultValue = '',
  unit = 'Па',
}) {
  const ref = useRef(null);
  const [err, setErr] = useState(false);
  return (
    <div
      className={`${style.inputContainer} ${err ? style.error : ''}`}
      style={dict?.[variant]}
      onClick={onFocus}
    >
      <input
        ref={ref}
        className={style.input}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        title={title}
        onBlur={onBlur}
      />
      <span
        className={`${style.unit} ${value === '' ? style.placeholder : ''}`}
      >
        {unit}
      </span>
    </div>
  );

  // Фокус ввода
  function onFocus(e) {
    ref.current.focus();
  }
  // Ввод текста
  function onChange(e) {
    let inputValue = e?.target?.value ?? e;

    // 1. Заменяем запятую на точку, чтобы пользователь мог вводить любой разделитель
    inputValue = inputValue.replace(',', '.');

    // 2. Разрешаем временные состояния: пустоту, минус, точку или число, заканчивающееся на точку (например, "5.")
    if (
      inputValue === '' ||
      inputValue === '-' ||
      inputValue === '.' ||
      inputValue === '-.'
    ) {
      setValue(inputValue);
      return;
    }

    // 3. Проверяем регулярным выражением: разрешаем только цифры, один минус в начале и одну точку
    const validNumberRegex = /^-?\d*\.?\d*$/;
    if (!validNumberRegex.test(inputValue)) {
      return; // Игнорируем ввод некорректных символов (буквы, вторая точка и т.д.)
    }

    const parsed = parseFloat(inputValue);
    if (!isNaN(parsed)) {
      setValue(inputValue); // Сохраняем строку, чтобы не терять точку на конце при вводе
    }
    // Значение не в границах min max
    if (+inputValue < min || +inputValue > max) setErr(true);
    else setErr(false);
  }

  // Границы min..max
  function clampValue(val) {
    if (val == '') return '';
    return Math.max(min, Math.min(max, val));
  }

  // Валидация при потере фокуса (blur)
  function onBlur() {
    let finalValue = parseFloat(value);

    if (
      value === '' ||
      value === '-' ||
      value === '.' ||
      value === '-.' ||
      isNaN(finalValue)
    ) {
      finalValue = defaultValue;
    }

    // Приводим к границам и сохраняем уже как чистое число
    setValue(clampValue(finalValue));
    setErr(false);
  }
}

export default InputNum;

const dict = {
  normal: {
    width: '412px',
    height: '52px',
  },
};
