import useViewStore from '@store/view'
import data from './data'
import Item from './item'
import './style.css'

//Верхнее меню склада
export default function Menu({}) {
	const mb = useViewStore((s) => s.mb())
	return (
		<menu className={mb}>
			{data.map((el) => (
				<Item data={el} key={el.id} />
			))}
		</menu>
	)
}
