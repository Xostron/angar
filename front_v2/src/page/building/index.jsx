import useInputStore from '@src/entities/store/input';
import ScrollGrid from '@src/shared/scroll-grid';
import { useParams } from 'react-router-dom';
import Outdoor from '@src/widgets/outdoor';
import Sidebar from '@src/shared/sidebar';
import Scard from './scard';
import Indoor from '@src/widgets/indoor';
import Alarm from './alarm';
import '../main/style.css';

// Склад: карточки секций
const BuildingPage = () => {
  const { buildingId: idB } = useParams();

  //   Карточки секций
  const sCard = useInputStore((s) => s?.input?.sCard?.[idB]);

  return (
    <main className="main-page">
      <Sidebar>
        <Outdoor />
        <Alarm idB={idB} />
      </Sidebar>
      <ScrollGrid>
        {sCard &&
          Object.values(sCard).map((el) => <Scard key={el?.idS} data={el} />)}
      </ScrollGrid>
      <Sidebar type="right">
        <Indoor idB={idB} />
      </Sidebar>
    </main>
  );
};

export default BuildingPage;
