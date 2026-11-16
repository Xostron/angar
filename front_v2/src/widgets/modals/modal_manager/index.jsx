import useModalStore from '@src/entities/store/modal';
import Dialog from '@src/widgets/modals/dialog';
// Сюда импортируете ваши разные диалоговые окна (контент)
import defModal from '@src/widgets/modals/def';

export default function ModalManager() {
  const { code, props, close, refDialog } = useModalStore();
  // Если ничего не открыто — не рендерим ничего
  if (!code) return <></>;

  const Entry = defModal[code];
  if (!Entry) return <div>Окно не найдено</div>;

  return (
    <Dialog isOpen={!!code} onClose={close}>
      <Entry {...props} closeModal={close} refDialog={refDialog} />
    </Dialog>
  );
}
