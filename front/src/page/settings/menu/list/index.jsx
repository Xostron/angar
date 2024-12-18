import { useParams } from 'react-router-dom'
import useEquipStore from '@store/equipment'
import data from '../../def'
import Item from './item'

//Отображение списка  настроек
export default function List({}) {
	const { build } = useParams()
	const [menuFactory] = useEquipStore(({ getMenuFactory }) => [getMenuFactory(build, data)])

	return (
		<section className='list-menu'>
			{menuFactory?.map((el, i) => (
				<Item data={el} index={i} key={el.id} />
			))}
		</section>
	)
}
