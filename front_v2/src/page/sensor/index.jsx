import ScrollGrid from '@src/shared/ui/scroll_grid';
import NavSec from './nav_sec';
import { useParams } from 'react-router-dom';
import Groups from './items';

const SensorPage = () => {
  const { buildingId: idB, type: idS } = useParams();

  return (
    <main style={{ backgroundColor: 'var(--c-grey-lighter)' }}>
      <NavSec idB={idB} idS={idS} />
      <ScrollGrid size={`sensor`} notPaging>
        <Groups idB={idB} idS={idS} />
      </ScrollGrid>
    </main>
  );
};

export default SensorPage;
