import turnoff from './turn_off';
import turnon from './turn_on';
import login from './login';

const defModal = {
  turnoff,
  turnon,
  login,
  WARN_WAREHOUSE: ({ message }) => <div>⚠️ Внимание: {message}</div>,
  CONFIRM_ACTION: ({ onConfirm }) => (
    <div>
      <p>Вы уверены?</p>
      <button onClick={onConfirm}>Да</button>
    </div>
  ),
};

export default defModal;
