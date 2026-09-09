import useInputStore from '@src/entities/store/input';
import ScrollGrid from '@src/shared/scroll-grid';
import { useParams } from 'react-router-dom';
import Outdoor from '@src/widgets/outdoor';
import Sidebar from '@src/shared/sidebar';
import '../main/style.css';
import Scard from './scard';
import Indoor from '@src/widgets/indoor';

// Склад: карточки секций
const BuildingPage = () => {
  const { buildingId: idB } = useParams();
  console.log(0, idB);

  //   Левая боковая панель - аварии склада
  const alarm = useInputStore((s) => s?.input?.sBarB?.[idB]);
  //   Карточки секций
  const sCard = useInputStore((s) => s?.input?.sCard?.[idB]);

  console.log(2, alarm);
  console.log(3, sCard);
  return (
    <main className="main-page">
      <Sidebar>
        <Outdoor />
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
