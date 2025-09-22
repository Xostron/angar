import { useState, useEffect } from 'react'
import useOutputStore from '@store/output'
import useViewStore from '@src/store/view'
import useInputStore from '@store/input'
import Item from './item'
import def from '@tool/status/section'
import Warming from '../warming'

//Панель управления секции: Пуск, Стоп, Выкл
export default function Cp({ buildId, sect, cls }) {
	const { input } = useInputStore()
	// Режим работы секции (авто - true, ручной - false, выкл - null || undefined)
	const mode = input.retain?.[buildId]?.mode?.[sect]
	// Панель неактивна (Связь с модулями потеряна, либо авария в главном цикле)
	const deactive = Object.keys(input).length ? false : true

	const { setMode } = useOutputStore()
	const [md, setMd] = useState(mode)

	useEffect(() => setMd(mode), [sect, mode])
	const mb = useViewStore((s) => s.mb())
	let cl = ['cp', mb, cls].join(' ')


	return (
		
		<nav className={cl}>
			{def.map((el) => (
				<Item deactive={deactive} key={el.id} data={el} cur={md} set={set} />
			))}
			<Warming cls={'build-warming'} />
		</nav>
	)

	function set(value) {
		setMd(value)
		setMode({ buildId, _id: sect, val: value })
	}
}
