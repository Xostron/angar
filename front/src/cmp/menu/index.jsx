import data from './data'
import Item from './item'
import './style.css'


//Верхнее меню склада
export default function Menu({}) {
	return (
		<menu>
			{data.map((el) => (
				<Item data={el} key={el.id} />
			))}
		</menu>
	)
}
