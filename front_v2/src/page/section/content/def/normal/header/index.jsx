import Toggle3 from '@src/shared/ui/button/toggle_button_3';
import useInputStore from '@src/entities/store/input';
import Button from '@src/shared/ui/button/btn';
import style from './style.module.css';

function Header({ idB, idS }) {
  const data = useInputStore((s) => s?.input?.innerSec?.[idB]?.[idS]);

  return (
    <div className={style.header}>
      {/* Навигация по секциям */}
      <nav className={style.nav}>
        {data?.listSec &&
          data?.listSec.map((el) => (
            <Button
              key={el._id}
              label={el.name}
              variant="sect"
              active={el._id == idS}
              disabled={false}
              onClick={() => {}}
            />
          ))}
      </nav>
      {/* Режимы работы */}
      <div className={style.mode}>
        <span>Режим работы секции</span>
        <Toggle3
          value={data?.mode?.[0]}
          on1={() => {}}
          on2={() => {}}
          on3={() => {}}
          disabled={false}
        />
      </div>
    </div>
  );
}

export default Header;
