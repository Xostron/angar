import useAuthStore from '@src/entities/store/auth';
import style from './style.module.css';
import Button from '@src/shared/ui/button/btn';

export default function Logout({ closeModal }) {
  const logout = useAuthStore((s) => s.logout);
  return (
    <div className={style.entry}>
      <h2 className={style.title}>Авторизация</h2>
      <p>Выйти из системы?</p>
      <div className={style.buttons}>
        <Button
          label="Нет"
          active={false}
          onClick={() => {
            closeModal();
          }}
          variant="grow"
        />
        <Button
          label="Да"
          active={true}
          onClick={() => {
            logout();
            closeModal();
          }}
          variant="grow"
        />
      </div>
    </div>
  );
}
