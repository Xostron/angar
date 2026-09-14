import useModalStore from '@src/entities/store/modal';
import BaseDialog from '@src/shared/ui/base_dialog';
// Сюда импортируете ваши разные диалоговые окна (контент)
import defModal from '@src/widgets/def_modal';

export default function ModalManager() {
  const { code, props, close } = useModalStore();
  // Если ничего не открыто — не рендерим ничего
  if (!code) return <></>;

  const Entry = defModal[code];
  if (!Entry) return <div>Окно не найдено</div>;

  return (
    <BaseDialog isOpen={!!code} onClose={close}>
      <Entry {...props} closeModal={close} />
    </BaseDialog>
  );
}
