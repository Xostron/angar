import turnoff from './turn_off';
import turnon from './turn_on';
import login from './login';
import logout from './logout';

const defModal = {
  turnoff,
  turnon,
  login,
  logout,
  WARN_WAREHOUSE: ({ message }) => <div>⚠️ Внимание: {message}</div>,
  CONFIRM_ACTION: ({ onConfirm }) => (
    <div>
      <p>Вы уверены?</p>
      <button onClick={onConfirm}>Да</button>
    </div>
  ),
};

export default defModal;
