import { useState, useEffect } from 'react';
import Button from '../btn';
import style from './style.module.css';

// 2х позиционный переключатель
function Toggle2({ value, on1, on2, disabled, trigger, resetTrigger }) {
  // loading - мигание кнопки
  const [loading, setLoading] = useState(0);

  // Сброс мигания кнопки по срабатыванию триггера (действие окончено)
  useEffect(() => {
    setLoading(0);
    if (resetTrigger) resetTrigger();
  }, trigger);

  return (
    <Container disabled={disabled}>
      <Button
        label="ВЫКЛ"
        variant="toggle2"
        active={value === false}
        disabled={disabled || value === false}
        onClick={() => {
          on1();
          setLoading(1);
        }}
        loading={loading === 1}
      />
      <Button
        label="ВКЛ"
        variant="toggle2"
        active={value === true}
        disabled={disabled}
        onClick={() => {
          on2();
          setLoading(2);
        }}
        loading={loading === 2}
      />
    </Container>
  );
}

function Container({ children, disabled }) {
  return (
    <div
      className={`${style.container} ${disabled ? style.disabled : ''}`}
      style={{ width: '274px', height: '55px' }}
    >
      {children}
    </div>
  );
}

export default Toggle2;
