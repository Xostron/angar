import useInputStore from '@src/entities/store/input';
import ScrollGrid from '../../shared/ui/scroll_grid';
import Outdoor from '../../widgets/outdoor';
import Sidebar from '../../shared/ui/sidebar';
import Bcard from '@src/widgets/bcard';
import './style.css';

// Начальная страница: карточки складов
const MainPage = () => {
  const bCard = useInputStore((s) => s?.input?.bCard);
  const arrB = Object.values(bCard ?? {});
  const isCN = arrB.some((bld) => bld.type != 'cold');

  return (
    <main className="main-page">
      <Sidebar>
        <Outdoor onOut={isCN} />
      </Sidebar>
      <ScrollGrid size="bcard">
        {bCard &&
          Object.values(bCard).map((el) => <Bcard key={el?.idB} data={el} />)}
      </ScrollGrid>
    </main>
  );
};

export default MainPage;
