import { useRef, useState, useEffect } from 'react';
import style from './style.module.css';
import useEquipStore from '@src/entities/store/equipment';
import Keyboard from '../keyboard';

function InputNum({
  id,
  type = 'text',
  value,
  setValue,
  placeholder,
  disabled,
  readOnly,
  min = -99999,
  max = 99999,
  title,
  size = 'normal',
  keyboard = 'numeric',
  defaultValue = '',
  unit = 'Па',
  icon,
  keyboardContainer, // Контейнер для портала (опционально)
  showInput = true,
}) {
  const [err, setErr] = useState(false);

  const [showKeyboard, setShowKeyboard] = useState(false);
  const inputRef = useRef(null);
  const keyboardInstanceRef = useRef(null); // Ref для экземпляра клавиатуры
  const apiInfo = useEquipStore((s) => s.apiInfo);
  if (!apiInfo?.keyboard) keyboard = false;

  useEffect(() => {
    if (!showKeyboard) return;

    const handleClickOutside = (event) => {
      // Проверяем, что клик был не по input
      if (inputRef.current && inputRef.current.contains(event.target)) return;

      // Проверяем, что клик был не по клавиатуре (в т.ч. через портал)
      const clickedKeyboard = event.target.closest('.keyboard-wrapper');
      if (clickedKeyboard) return;
      // Закрываем клавиатуру
      setShowKeyboard(false);
    };

    // Небольшая задержка, чтобы не закрыть клавиатуру сразу после открытия
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showKeyboard]);

  // Определяем тип клавиатуры
  const getKeyboardType = () => {
    // По умолчанию: numeric для number, иначе default
    if (keyboard === true) return type === 'number' ? 'numeric' : 'default';
    if (typeof keyboard === 'string') return keyboard;
    return 'default';
  };

  //   Нужна ли клавиатура
  const needsKeyboard =
    type !== 'time' && keyboard !== undefined && keyboard !== false;

  // Обработчик клика по полю
  const handleInputClick = (e) => {
    if (needsKeyboard) setShowKeyboard(true);
    if (onClick) onClick(e);
  };

  return (
    <>
      <div
        className={`${style.inputContainer} ${err ? style.error : ''}`}
        style={dictSize?.[size] ?? {}}
        onClick={onFocus}
      >
        {icon && <img src={icon} />}
        <input
          ref={inputRef}
          id={id}
          className={`${style.input}  ${err ? style.error : ''}`}
          type={type}
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
          className={`${style.unit} ${value === '' ? style.placeholder : ''} ${err ? style.error : ''}`}
        >
          {unit}
        </span>
      </div>
      {/* Клавиатура */}
      {needsKeyboard && showKeyboard && (
        <Keyboard
          type={getKeyboardType()}
          value={value}
          onChange={(v) => {
            onChange({ target: { value: v } });
          }}
          onClose={() => setShowKeyboard(false)}
          container={keyboardContainer}
          showInput={showInput}
          placeholder={placeholder}
          keyboardInstanceRef={keyboardInstanceRef}
        />
      )}
    </>
  );

  // Фокус ввода
  function onFocus(e) {
    inputRef.current.focus();
    handleInputClick(e);
  }
  // Ввод текста
  function onChange(e) {
    let inputValue = e?.target?.value ?? e;
    // Синхронизируем клавиатуру после валидации
    const syncKeyboard = (value) => {
      if (keyboardInstanceRef.current) {
        keyboardInstanceRef.current.setInput(String(value));
      }
    };

    // 1. Заменяем запятую на точку, чтобы пользователь мог вводить любой разделитель
    inputValue = inputValue.replace(',', '.');

    // 2. Разрешаем временные состояния: пустоту, минус, точку или число, заканчивающееся на точку (например, "5.")
    if (
      inputValue === '' ||
      inputValue === '-' ||
      inputValue === '.' ||
      inputValue === '-.'
    ) {
      syncKeyboard(inputValue);
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
      syncKeyboard(inputValue);
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
    syncKeyboard(clampValue(finalValue));
    setValue(clampValue(finalValue));
    setErr(false);
  }
}

export default InputNum;

// Размеры полей ввода
const dictSize = {
  normal: {
    width: '412px',
    height: '52px',
  },
  sensor: {
    width: '121px',
    height: '36px',
    padding: '4px',
    justifyItems: 'center',
  },
};
