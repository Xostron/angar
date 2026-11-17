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
  console.log(123, mode);
  return (
    <div className={style.mode}>
      <span>Режим работы секции</span>
      <Toggle3
        value={mode?.[0]}
        on1={() => {
          openModal('section', { value: null });
        }}
        on2={() => {
          openModal('section', { value: true });
        }}
        on3={() => {
          openModal('section', { value: false });
        }}
        disabled={false}
      />
    </div>
  );
}

export default ModeSec;
