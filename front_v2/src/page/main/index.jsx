import useInputStore from '@src/entities/store/input';
import ScrollGrid from '../../shared/scroll-grid';
import Outdoor from '../../widgets/outdoor';
import Sidebar from '../../shared/sidebar';
import Bcard from '@src/widgets/bcard';
import './style.css';

// Начальная страница: карточки складов
const MainPage = () => {
  const bCard = useInputStore((s) => s?.input?.bCard);
  console.log(bCard);
  return (
    <main className="main-page">
      <Sidebar>
        <Outdoor />
      </Sidebar>
      <ScrollGrid>
        {bCard &&
          Object.values(bCard).map((el) => <Bcard key={el?.idB} data={el} />)}
      </ScrollGrid>
    </main>
  );
};

export default MainPage;
