import { useNavigate } from 'react-router-dom';
import useInputStore from '@src/entities/store/input';
import Button from '@src/shared/ui/button/btn';
import style from './style.module.css';
import useEquipStore from '@src/entities/store/equipment';

/**
 * Навигация по секциям
 * @param {*} param0
 * @returns
 */
function NavSec({ idB, idS }) {
  const navigate = useNavigate();

  const sections = useEquipStore((s) => s.getBld(idB)?.section);
  const list = navList(sections);

  return (
    <nav className={style.nav}>
      {list &&
        list.map((el) => (
          <Button
            key={el._id}
            label={el.name}
            variant="sensor"
            active={el._id == idS}
            disabled={false}
            onClick={() => onNavi(el._id)}
          />
        ))}
    </nav>
  );
  // Навигация по секциям
  function onNavi(id) {
    navigate(`/building/${idB}/sensor/${id}`);
  }
}

export default NavSec;

/**
 * Сформировать список навигации
 * @param {object[]} sections рама секции
 * @returns {object[]}
 */
export function navList(sections = []) {
  const r = [{ _id: 'all', name: 'Общие' }, ...sections];
  // Список устройств pui со всех секций
  const pui = sections.flatMap((el) =>
    el.device?.filter((d) => d?.device?.code === 'pui'),
  );
  if (pui.length) r.splice(1, 0, { _id: 'pui', name: 'Сеть' });
  return r;
}
