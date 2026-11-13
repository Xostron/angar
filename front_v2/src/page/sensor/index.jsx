import ScrollGrid from '@src/shared/ui/scroll_grid';
import NavSec from './nav_sec';
import { useParams } from 'react-router-dom';
import Groups from './items';
import style from './style.module.css';
import Button from '@src/shared/ui/button/btn';

const SensorPage = () => {
  const { buildingId: idB, type: idS } = useParams();

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
        />
        <Button
          label="Сохранить"
          variant="usual"
          active={true}
          disabled={false}
        />
      </div>
    </main>
  );
};

export default SensorPage;
