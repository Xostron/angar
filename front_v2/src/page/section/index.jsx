import ScrollGrid from '@src/shared/ui/scroll_grid';
import { useParams } from 'react-router-dom';
import Outdoor from '@src/widgets/outdoor';
import Sidebar from '@src/shared/ui/sidebar';
import Indoor from '@src/widgets/indoor';
import AsideAlarm from '../../widgets/aside_alarm';
import useEquipStore from '@src/entities/store/equipment';
import defSection from './content'
import '../main/style.css';

// Склад: карточки секций
const SectionPage = () => {
  const { buildingId: idB, sectionId: idS } = useParams();

  //   Тип склада
  const bType = useEquipStore((s) => s.getBld(idB)?.type);
  const Sec = defSection?.[bType];

  return (
    <main className="main-page">
      <Sidebar>
        <Outdoor />
        <AsideAlarm idB={idB} />
      </Sidebar>
      {/* <ScrollGrid notPaging={true}> */}
        {Sec && <Sec idB={idB} idS={idS} />}
      {/* </ScrollGrid> */}
      <Sidebar type="right">
        <Indoor idB={idB} />
      </Sidebar>
    </main>
  );
};

export default SectionPage;
