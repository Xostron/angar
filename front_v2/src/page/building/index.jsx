import useInputStore from '@src/entities/store/input';
import ScrollGrid from '@src/shared/ui/scroll_grid';
import { useParams } from 'react-router-dom';
import Outdoor from '@src/widgets/outdoor';
import Sidebar from '@src/shared/ui/sidebar';
import Indoor from '@src/widgets/indoor';
import AsideAlarm from '../../widgets/aside_alarm';
import useEquipStore from '@src/entities/store/equipment';
import ScardNormal from '@src/widgets/scard/def/normal';
import defScard from '@src/widgets/scard';
import '../main/style.css';

// Склад: карточки секций
const BuildingPage = () => {
  const { buildingId: idB } = useParams();

  //   Карточки секций
  const sCard = useInputStore((s) => s?.input?.sCard?.[idB]);
  //   Тип склада
  const bType = useEquipStore((s) => s.getBld(idB)?.type);
  //   Карточка секции
  const Scard = defScard?.[bType] ?? ScardNormal;

  return (
    <main className="main-page">
      <Sidebar>
        <Outdoor />
        <AsideAlarm idB={idB} />
      </Sidebar>
      <ScrollGrid size={`scard_${bType ?? 'normal'}`}>
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
