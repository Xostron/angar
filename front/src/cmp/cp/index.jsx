import { useState, useEffect } from 'react'
import useOutputStore from '@store/output'
import useViewStore from '@src/store/view'
import useInputStore from '@store/input'
import Item from './item'
import def from '@tool/status/section'
import Warming from './warming'
import './style.css'

//Панель управления секции: Пуск, Стоп, Выкл
export default function Cp({ buildId, sect, cls }) {
	const mb = useViewStore((s) => s.mb())
	const setMode = useOutputStore((s) => s.setMode)
	const input = useInputStore((s) => s.input)
	// Режим работы секции (авто - true, ручной - false, выкл - null || undefined)
	const mode = input.retain?.[buildId]?.mode?.[sect]
	// Панель неактивна (Связь с модулями потеряна, либо авария в главном цикле)
	const deactive = Object.keys(input).length ? false : true

	const [md, setMd] = useState(mode)

	useEffect(() => setMd(mode), [sect, mode])
	let cl = ['page-section-sidebar-cp', mb, cls].join(' ')

	return (
		<nav className={cl}>
			{def.map((el) => (
				<Item deactive={deactive} key={el.id} data={el} cur={md} set={set} />
			))}
			<Warming cls={'page-section-sidebar-warming'} />
		</nav>
	)

	function set(value) {
		setMd(value)
		setMode({ buildId, _id: sect, val: value })
	}
}
