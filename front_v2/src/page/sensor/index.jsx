import ScrollGrid from '@src/shared/ui/scroll_grid';
import NavSec from './nav_sec';
import { useNavigate, useParams } from 'react-router-dom';
import Groups from './items';
import style from './style.module.css';
import Button from '@src/shared/ui/button/btn';
import useOutputStore from '@src/entities/store/output';
import useModalStore from '@src/entities/store/modal';

const SensorPage = () => {
  const { buildingId: idB, type: idS } = useParams();
  const navigate = useNavigate();
  const sendSens = useOutputStore((s) => s.sendSens);
  const openModal = useModalStore((s) => s.open);
  return (
    <main className={style.main}>
      <NavSec idB={idB} idS={idS} />
      <ScrollGrid size={`sensor`} notPaging orientation="top">
        <Groups idB={idB} idS={idS} />
      </ScrollGrid>
      <div className={style.btns}>
        <Button
          label="Отмена"
          variant="usual"
          active={false}
          disabled={false}
          styl={{ backgroundColor: 'var(--c-white)' }}
          onClick={() => navigate(-1)}
        />
        <Button
          label="Сохранить"
          variant="usual"
          active={true}
          disabled={false}
          onClick={open}
        />
      </div>
    </main>
  );
  function open() {
    openModal('ConfirmAction', { fnYes: sendSens });
  }
};

export default SensorPage;
