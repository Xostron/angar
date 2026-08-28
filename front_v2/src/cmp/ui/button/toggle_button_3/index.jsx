import Button from '../btn';
import style from './style.module.css';

// 2х позиционный переключатель
function Toggle3({ value, on1, on2, on3, disabled }) {
  return (
    <Container disabled={disabled}>
      <Button
        label="ВЫКЛ"
        variant="toggle3"
        active={value === false}
        disabled={disabled}
        onClick={on1}
      />
      <Button
        label="ВКЛ"
        variant="toggle3"
        active={value === true}
        disabled={disabled}
        onClick={on2}
      />
      <Button
        label="РУЧ"
        variant="toggle3"
        active={value === null}
        disabled={disabled}
        onClick={on3}
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

export default Toggle3;
