import Toggle3 from '@src/shared/ui/button/toggle_button_3';
import useInputStore from '@src/entities/store/input';
import style from './style.module.css';
import useModalStore from '@src/entities/store/modal';

/**
 * Переключение режимов секции
 * @param {*} param0
 * @returns
 */
function ModeSec({ idB, idS }) {
  const mode = useInputStore((s) => s?.input?.innerSec?.[idB]?.[idS]?.mode);
  const openModal = useModalStore((s) => s.open);
  return (
    <div className={style.mode}>
      <span>Режим работы секции</span>
      <Toggle3
        value={mode?.[0]}
        on1={() => {
          openModal('section', { value: null, idB, idS });
        }}
        on2={() => {
          openModal('section', { value: true, idB, idS });
        }}
        on3={() => {
          openModal('section', { value: false, idB, idS });
        }}
        disabled={false}
      />
    </div>
  );
}

export default ModeSec;
