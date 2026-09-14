import Start from './start';

const defModal = {
  Start,
  WARN_WAREHOUSE: ({ message }) => <div>⚠️ Внимание: {message}</div>,
  CONFIRM_ACTION: ({ onConfirm }) => (
    <div>
      <p>Вы уверены?</p>
      <button onClick={onConfirm}>Да</button>
    </div>
  ),
};

export default defModal;
