import { Link } from 'react-router-dom'
import useInputStore from '@store/input'
import './style.css'
import Other from './fn/other'
import Tprd from './fn/tprd'
import { useShallow } from 'zustand/react/shallow'

export default function Item({ sec = {}, bId, iSect, cls }) {
	const { _id, name, valve, heating, fan } = sec
	// Показания и настройки
	const input = useInputStore((s) => s.input)
	const retain = input?.retain?.[bId]
	// ссылка на секцию
	const path = 'section/' + _id
	// Режим работы секции
	const mode = retain?.mode?.[_id] === true ? 'Автомат.' : retain?.mode?.[_id] === false ? 'Ручной' : 'Выключена'
	// Клапаны, вентилятор и обогреватель
	const other = { valve, heating, fan }

	let cl = ['section', 'sx' + cls]
	cl = cl.join(' ')

	return (
		<Link className={cl} to={path}>
			<span className={`section-name sx${cls}`}>
				{name} <span className={`section-mode ssx${cls}`}>{mode}</span>
			</span>
			<Tprd sId={_id} />
			<Other buildId={bId} data={other} sect={iSect} cls={'vfx' + cls} />
		</Link>
	)
}
