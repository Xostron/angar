import useModalStore from '@src/entities/store/modal';
import BaseDialog from '@src/shared/ui/base_dialog';
// Сюда импортируете ваши разные диалоговые окна (контент)
const def = {
  WARN_WAREHOUSE: ({ message }) => <div>⚠️ Внимание: {message}</div>,
  CONFIRM_ACTION: ({ onConfirm }) => (
    <div>
      <p>Вы уверены?</p>
      <button onClick={onConfirm}>Да</button>
    </div>
  ),
};

export default function ModalManager() {
  const { code, props, close } = useModalStore();
  // Если ничего не открыто — не рендерим ничего
  if (!code) return <></>;

  const Entry = def[code];
  if (!Entry) return <div>Окно не найдено</div>;

  return (
    <BaseDialog isOpen={!!code} onClose={close}>
      <Entry {...props} closeModal={close} />
    </BaseDialog>
  );
}
