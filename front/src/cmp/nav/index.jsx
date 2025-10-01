import useEquipStore from '@store/equipment'
import useViewStore from '@src/store/view'
import Item from './item'
import './style.css'

//Навигация по секциям
export default function Nav({ cur, ph, dialog, hasChanged }) {
	const sections = useEquipStore((s) => s.sections())
	const mb = useViewStore((s) => s.mb())
	let cl = ['nav']
	let list = sections
	// Для страницы "Датчики"
	if (ph === 'sensor') {
		cl.push(...['nav-h-sen', mb])
		list = navList(sections)
	}
	// Для страницы "Склад"
	if (ph === 'section') cl.push(...['page-section-nav', mb])
	cl = cl.join(' ')
	const stl = !mb ? { gridTemplateRows: `repeat(${list.length}, var(--fsz65))` } : {}

	return (
		<nav style={stl} className={cl}>
			{list?.length &&
				list.map((el) => (
					<Item
						key={el._id}
						data={el}
						cur={cur}
						ph={ph}
						dialog={dialog}
						hasChanged={hasChanged}
					/>
				))}
		</nav>
	)
}

/**
 * Сформировать список навигации
 * @param {object[]} sections рама секции
 * @returns {object[]}
 */
export function navList(sections = []) {
	const r = [{ _id: 'all', name: 'Общие' }, ...sections]
	// Список устройств pui со всех секций
	const pui = sections.flatMap((el) => el.device?.filter((d) => d?.device?.code === 'pui'))
	if (pui.length) r.splice(1, 0, { _id: 'pui', name: 'Сеть' })
	return r
}
