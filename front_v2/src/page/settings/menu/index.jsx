import List from './list';
import style from './style.module.css';

//Список настроек склада
export default function Menu({}) {
  return (
    <main className={style.setting_menu}>
      <List />
    </main>
  );
}
