import ScrollGrid from '@src/shared/ui/scroll_grid';
import NavSec from './nav_sec';
import { useParams } from 'react-router-dom';

const SensorPage = () => {
  const { buildingId: idB, type: idS } = useParams();
  return (
    <main>
      <NavSec idB={idB} idS={idS} />
      <ScrollGrid size={`sensor`}>
        {[1, 2, 3].map((el) => (
          <div style={{ width: 292, height: 314, border: 'solid 1px black' }}>
            el
          </div>
        ))}
      </ScrollGrid>
    </main>
  );
};

export default SensorPage;
