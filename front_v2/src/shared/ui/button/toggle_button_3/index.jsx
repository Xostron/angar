import { useState, useEffect } from 'react';
import Button from '../btn';
import style from './style.module.css';

// 2х позиционный переключатель
function Toggle3({ value, on1, on2, on3, disabled, trigger, resetTrigger }) {
  // loading - мигание кнопки
  const [loading, setLoading] = useState(0);

  // Сброс мигания кнопки по срабатыванию триггера (действие окончено)
  useEffect(() => {
    setLoading(0);
    if (resetTrigger) resetTrigger();
  }, trigger);

  return (
    <Container className={style.container} disabled={disabled}>
      <Button
        label="ВЫКЛ"
        variant="toggle3"
        active={value === null || value === undefined}
        disabled={disabled}
        onClick={() => {
          on1();
          setLoading(1);
        }}
        loading={loading === 1}
      />
      <Button
        label="АВТО"
        variant="toggle3"
        active={value === true}
        disabled={disabled}
        onClick={() => {
          on2();
          setLoading(2);
        }}
      />
      <Button
        label="РУЧН"
        variant="toggle3"
        active={value === false}
        disabled={disabled}
        onClick={() => {
          on3();
          setLoading(3);
        }}
      />
    </Container>
  );
}

function Container({ children, disabled }) {
  return (
    <div className={`${style.container} ${disabled ? style.disabled : ''}`}>
      {children}
    </div>
  );
}

export default Toggle3;
