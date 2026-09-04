import Sidebar from '../../shared/sidebar';
import ScrollGrid from '../../shared/scroll-grid';
import Outdoor from '../../widgets/outdoor';
import Bcard from './building';
import './style.css';
import useInputStore from '@src/entities/store/input';

const MainPage = () => {
  const bCard = useInputStore((s) => s?.input?.bCard);
  return (
    <main className="main-page">
      <Sidebar>
        <Outdoor />
      </Sidebar>
      <ScrollGrid>
        {bCard &&
          Object.values(bCard).map((el) => <Bcard key={el?.id} data={el} />)}
      </ScrollGrid>
    </main>
  );
};

export default MainPage;
