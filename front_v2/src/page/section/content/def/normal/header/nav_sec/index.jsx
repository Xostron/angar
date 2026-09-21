import { useNavigate } from 'react-router-dom';
import useInputStore from '@src/entities/store/input';
import Button from '@src/shared/ui/button/btn';
import style from './style.module.css';

/**
 * Навигация по секциям
 * @param {*} param0
 * @returns
 */
function NavSec({ idB, idS }) {
  const listSec = useInputStore(
    (s) => s?.input?.innerSec?.[idB]?.[idS]?.listSec,
  );
  const navigate = useNavigate();

  return (
    <nav className={style.nav}>
      {listSec &&
        listSec.map((el) => (
          <Button
            key={el._id}
            label={el.name}
            variant="sect"
            active={el._id == idS}
            disabled={false}
            onClick={() => onNavi(el._id)}
          />
        ))}
    </nav>
  );
  // Навигация по секциям
  function onNavi(id) {
    navigate(`/building/${idB}/section/${id}`);
  }
}

export default NavSec;
