import turnoff from './turn_off';
import turnon from './turn_on';

const defModal = {
  turnoff,
  turnon,
  WARN_WAREHOUSE: ({ message }) => <div>⚠️ Внимание: {message}</div>,
  CONFIRM_ACTION: ({ onConfirm }) => (
    <div>
      <p>Вы уверены?</p>
      <button onClick={onConfirm}>Да</button>
    </div>
  ),
};

export default defModal;
