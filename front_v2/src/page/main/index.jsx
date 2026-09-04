import Sidebar from '../../shared/sidebar';
import ScrollGrid from '../../shared/scroll-grid';
import Outdoor from '../../widgets/outdoor';
import Building from './building';
import './style.css';

const PLACEHOLDERS = Array.from({ length: 16 }, (_, i) =>({
		id: i,
		type: "cold", 
		name: `Склад ${i + 1}`,
		code: `2025-${i + 1}`,
		mode: 'Авто',
		product: "Лук",
		mode: "Сушка",
		fan: true,
		tmin: -4,
		tmax: +4,
		hout: 20,
		note: "t задания канала 12°С, t задания продукта 11°С"
	}) );

const MainPage = () => {
  return (
    <main className="main-page">
      <Sidebar>
        <Outdoor />
      </Sidebar>
      <ScrollGrid>
        {PLACEHOLDERS.map((item) => <Building key={item?.id} data={item} />)}
      </ScrollGrid>
    </main>
  );
};

export default MainPage;
