import Button from '../btn';
import style from './style.module.css';

// 2х позиционный переключатель
function Toggle2({ value, on1, on2, disabled }) {
  return (
    <Container disabled={disabled}>
      <Button
        label="ВЫКЛ"
        variant="toggle2"
        active={value === false}
        disabled={disabled}
        onClick={on1}
      />
      <Button
        label="ВКЛ"
        variant="toggle2"
        active={value === true}
        disabled={disabled}
        onClick={on2}
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
