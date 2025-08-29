import { useEffect, useState } from "react";
import useAuthStore from "@store/auth";
import { validNumber, decimal } from "@tool/number";
import "../style.css";

//Поле ввода
export default function Input({
  value,
  setValue,
  style,
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
}) {
  const { isAuth } = useAuthStore(({ isAuth }) => ({ isAuth }));
  const [val, setVal] = useState(value);

  // Защита от сброса курсора в конец текста
  useEffect(() => {
    if (val !== value) {
      setVal(value);
    }
  }, [value, val]);

  let cl = ["cell input", cls];
  const dis = !disabled ? auth && !isAuth : typeof disabled == "boolean" ? true : false;
  if (!dis) cl.push("auth-input");
  cl = cl.join(" ");

  const mini = min ?? -12000;
  const maxi = max ?? 12000;

  return (
    <div style={{ ...style }} className={cl}>
      {icon && <img src={icon} />}
      <input
        type={type === "number" ? "text" : type}
        style={sti}
        min={mini}
        max={maxi}
        step={step}
        placeholder={placeholder}
        value={val}
        onChange={onChange}
		onBlur={onBlur}
        disabled={dis}
        title={title}
      />
    </div>
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
