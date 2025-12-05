import { useEffect, useState, useRef } from "react";
import useAuthStore from "@store/auth";
import { validNumber, decimal } from "@tool/number";
import Keyboard from "@cmp/keyboard";
import "../style.css";
import useEquipStore from '@store/equipment'	

//Поле ввода
export default function Input({
  value,
  setValue,
  style,
  id,
  placeholder,
  icon,
  sti,
  type = "text",
  min,
  max,
  step,
  cls,
  disabled = false,
  title,
  auth = true,
  onFocus,
  onClick,
  keyboard="numeric", // undefined|false - нет клавиатуры, true - тип по умолчанию, string - указанный тип
  keyboardContainer, // Контейнер для портала (опционально)
  showInput=true
}) {
  const { isAuth } = useAuthStore(({ isAuth }) => ({ isAuth }));
  const [val, setVal] = useState(value);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const inputRef = useRef(null);
  const apiInfo = useEquipStore((s) => s.apiInfo)
  if(!apiInfo?.keyboard) keyboard = false;
  // Защита от сброса курсора в конец текста
  useEffect(() => {
    if (val !== value) {
      setVal(value);
    }
  }, [value, val]);

  // Закрытие клавиатуры при клике вне её области
  useEffect(() => {
    if (!showKeyboard) return;

    const handleClickOutside = (event) => {
      // Проверяем, что клик был не по input
      if (inputRef.current && inputRef.current.contains(event.target)) {
        return;
      }

      // Проверяем, что клик был не по клавиатуре (в т.ч. через портал)
      const clickedKeyboard = event.target.closest('.keyboard-wrapper');
      if (clickedKeyboard) {
        return;
      }

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
    if (keyboard === true) {
      // По умолчанию: numeric для number, иначе default
      return type === "number" ? "numeric" : "default";
    }
    if (typeof keyboard === "string") {
      return keyboard;
    }
    return "default";
  };

//   Нужна ли клавиатура
// TODO: НУЖНА Глобальная переменная
  const needsKeyboard = type !=='time' && keyboard !== undefined && keyboard !== false;

  // Обработчик клика по полю
  const handleInputClick = (e) => {
    if (needsKeyboard && !dis) {
      setShowKeyboard(true);
    }
    if (onClick) {
      onClick(e);
    }
  };

  // Закрытие клавиатуры
  const handleCloseKeyboard = () => {
    setShowKeyboard(false);
  };

  let cl = ["cell input", cls];
  const dis = !disabled ? auth && !isAuth : typeof disabled == "boolean" ? true : false;
  if (!dis) cl.push("auth-input");
  cl = cl.join(" ");

  const mini = min ?? -12000;
  const maxi = max ?? 12000;

  return (
    <>
      <div style={{ ...style }} className={cl}>
        {icon && <img src={icon} />}
        <input
          ref={inputRef}
          id={id}
          type={type === "number" ? "text" : type}
          style={sti}
          min={mini}
          max={maxi}
          step={step}
          placeholder={placeholder}
          value={val}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          onClick={handleInputClick}
          disabled={dis}
          title={title}
          readOnly={needsKeyboard && showKeyboard} // Только чтение когда клавиатура активна
        />
      </div>
      
      {/* Клавиатура */}
      {needsKeyboard && showKeyboard && (
        <Keyboard
          type={getKeyboardType()}
          value={val}
          onChange={(newValue) => {
            setVal(newValue);
            setValue(newValue);
          }}
          onClose={handleCloseKeyboard}
          container={keyboardContainer}
          showInput={showInput}
          placeholder={placeholder}
        />
      )}
    </>
  );

  function onChange(e) {
    let v = e.target.value;
    // Валидация для Number
    if (type === "number") v = validNumber(e.target.value, mini);
    if (Number.isInteger(step) && +v) v = Math.floor(+v);

    if (maxi && mini >= 0 && maxi.toString().length > 1 && +v * 10 < maxi) {
      return setValue(v);
    } else if ((v || v === 0) && mini > +v) {
      return setValue(mini);
    }
    if ((v || v === 0) && maxi < +v) return setVal(maxi);

    if (type === "number") v = decimal(v, 2);

    setVal(v);
    setValue(v);
  }
  function onBlur(e){
	let v = e.target.value
	if (v < mini) {
		return setValue(mini)
	}
	setValue(v);
  }
}
