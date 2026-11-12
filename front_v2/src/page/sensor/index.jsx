import ScrollGrid from '@src/shared/ui/scroll_grid';
import NavSec from './nav_sec';
import { useParams } from 'react-router-dom';
import Groups from './items';
import style from './style.module.css';

const SensorPage = () => {
  const { buildingId: idB, type: idS } = useParams();

  return (
    <main className={style.main}>
      <NavSec idB={idB} idS={idS} />
      <ScrollGrid size={`sensor`} notPaging orientation="top">
        <Groups idB={idB} idS={idS} />
      </ScrollGrid>
    </main>
  );
};

export default SensorPage;
