import { useEffect, useState, useRef } from 'react';
import style from './style.module.css';
import useEquipStore from '@src/entities/store/equipment';
import Keyboard from '../keyboard';

function InputPsw({
  id,
  value,
  setValue,
  placeholder,
  title,
  onClick,
  keyboard = 'numeric', // undefined|false - нет клавиатуры, true - тип по умолчанию, string - указанный тип
  keyboardContainer, // Контейнер для портала (опционально)
  showInput = true,
}) {
  const [err, setErr] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [showKeyboard, setShowKeyboard] = useState(false);
  const inputRef = useRef(null);
  const keyboardInstanceRef = useRef(null); // Ref для экземпляра клавиатуры
  const apiInfo = useEquipStore((s) => s.apiInfo);
  if (!apiInfo?.keyboard) keyboard = false;

  // Закрытие клавиатуры при клике вне её области
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

  //   Нужна ли клавиатура
  const needsKeyboard = keyboard !== undefined && keyboard !== false;

  // Обработчик клика по полю
  const handleInputClick = (e) => {
    if (needsKeyboard) setShowKeyboard(true);
    if (onClick) onClick();
  };

  return (
    <>
      <div
        className={`${style.inputContainer} ${err ? style.error : ''}`}
        // onClick={onFocus}
      >
        <img className={style.lock} src={'/icon/indicator/psw.svg'} />
        <input
          ref={inputRef}
          id={id}
          className={`${style.input}  ${err ? style.error : ''}`}
          type={showPassword ? 'text' : 'password'}
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          title={title}
          onClick={handleInputClick}
          readOnly={needsKeyboard && showKeyboard} // Только чтение когда клавиатура активна
        />
        {showPassword ? (
          <img
            className={style.eye_active}
            src={'/icon/indicator/eye_active.svg'}
            onClick={() => setShowPassword((prev) => !prev)}
          />
        ) : (
          <img
            className={style.eye}
            src={'/icon/indicator/eye.svg'}
            onClick={() => setShowPassword((prev) => !prev)}
          />
        )}
      </div>
      {/* Клавиатура */}
      {needsKeyboard && showKeyboard && (
        <Keyboard
          type={keyboard}
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
  }
  // Ввод текста
  function onChange(e) {
    let inputValue = e?.target?.value;

    // Синхронизируем клавиатуру после валидации
    // const syncKeyboard = (value) => {
    //   if (keyboardInstanceRef.current) {
    //     keyboardInstanceRef.current.setInput(String(value));
    //   }
    // };
    // // syncKeyboard(inputValue);
    setValue(inputValue);
  }
}

export default InputPsw;
