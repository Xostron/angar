import Toggle3 from '@src/shared/ui/button/toggle_button_3';
import useInputStore from '@src/entities/store/input';
import style from './style.module.css';

/**
 * Переключение режимов секции
 * @param {*} param0
 * @returns
 */
function ModeSec({ idB, idS }) {
  const mode = useInputStore((s) => s?.input?.innerSec?.[idB]?.[idS]?.mode);

  return (
    <div className={style.mode}>
      <span>Режим работы секции</span>
      <Toggle3
        value={mode?.[0]}
        on1={() => {}}
        on2={() => {}}
        on3={() => {}}
        disabled={false}
      />
    </div>
  );
}

export default ModeSec;
