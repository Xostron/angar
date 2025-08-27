import { useParams } from 'react-router-dom'
import useEquipStore from '@store/equipment'
import Item from './item'
import data from '../def'

//Навигация по настройкам
export default function Nav({ cur, st, dialog, hasChanged }) {
	const { build } = useParams()
	const menuFactory = useEquipStore((s) => s.getMenuFactory(build, data))
	return (
		<nav style={st} className='nav-set'>
			{menuFactory?.map((el, i) => (
				<Item
					data={el}
					key={i}
					cur={cur}
					index={i}
					dialog={dialog}
					hasChanged={hasChanged}
				/>
			))}
		</nav>
	)
}
