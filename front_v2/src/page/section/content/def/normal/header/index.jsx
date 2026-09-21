import NavSec from './nav_sec';
import ModeSec from './mode_sec';
import style from './style.module.css';

/**
 * Заголовок:
 * 1. Навигация по секциям
 * 2. Переключение режимов секции
 * @param {*} param0
 * @returns
 */
function Header({ idB, idS }) {
  return (
    <div className={style.header}>
      {/* Навигация по секциям */}
      <NavSec idB={idB} idS={idS} />
      {/* Режимы работы */}
      <ModeSec idB={idB} idS={idS} />
    </div>
  );
}

export default Header;
