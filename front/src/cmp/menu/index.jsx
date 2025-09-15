import useViewStore from '@store/view'
import data from './data'
import Item from './item'
import './style.css'

//Верхнее меню склада
export default function Menu({}) {
	const mb = useViewStore((s) => s.mb())
	const bmb = useViewStore((s) => s.bmb())

	return (
		<menu className={mb}>
			{data?.map((el) => (
				<Item data={el} key={el.id} />
			))}
			{bmb && <Item data={service} />}
		</menu>
	)
}

const service = {
	id: 7,
	title: 'Сервис',
	path: 'service/1',
	icon: '/img/service/service.svg',
	active: ['service'],
}
