import Button from '@src/shared/ui/button/btn';
import style from './style.module.css';

export default function ConfirmAction({ fnYes, closeModal, refDialog }) {
  return (
    <div className={style.entry}>
      <h2 className={style.title}>Сохранить изменения?</h2>
      <div className={style.buttons}>
        <Button
          label="Отмена"
          variant="usual"
          active={false}
          onClick={closeModal}
        />
        <Button
          label="Да, сохранить"
          variant="usual"
          active={true}
          onClick={() => {
            fnYes();
            closeModal();
          }}
        />
      </div>
    </div>
  );
}
