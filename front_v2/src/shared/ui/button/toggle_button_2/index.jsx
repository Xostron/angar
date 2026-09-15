import { useState, useEffect } from 'react';
import Button from '../btn';
import style from './style.module.css';

// 2х позиционный переключатель
function Toggle2({ value, on1, on2, disabled, trigger }) {
  // Ожидание изменения value
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  // После изменения value, сбрасываем loader
  useEffect(() => {
    setLoading1(false);
    setLoading2(false);
  }, [...trigger]);

  return (
    <Container disabled={disabled}>
      <Button
        label="ВЫКЛ"
        variant="toggle2"
        active={value === false}
        disabled={disabled || value === false}
        onClick={() => {
          on1();
          setLoading1(true);
          setLoading2(false);
        }}
        loading={loading1}
      />
      <Button
        label="ВКЛ"
        variant="toggle2"
        active={value === true}
        disabled={disabled}
        onClick={() => {
          on2();
          setLoading2(true);
          setLoading1(false);
        }}
        loading={loading2}
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
