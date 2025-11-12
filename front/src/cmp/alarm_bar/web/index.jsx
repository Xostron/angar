import { useParams } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import useInputStore from '@store/input'
import Item from './item'
import './style.css'
import { useState } from 'react'
import { fnAlarm, fnAlarmB } from '../fn'

//Панель управления - аварийные индикаторы
export default function AlarmBar({ setActive }) {
	const [show, setShow] = useState(false)
	const { build, sect } = useParams()
	const [bar, barB, timer] = useInputStore(({ alarm }) => [alarm.bar, alarm.barB, alarm.timer])
	// Аварии для панели
	let r
	if (sect) r = fnAlarm(build, sect, bar, timer)
	else r = fnAlarmB(build, barB, timer)
	const { alr, tmr } = r
	// Свернуть панель
	const action = () => {
		setShow((pr) => (pr = !pr))
		if (!!setActive) setActive((pr) => (pr = !pr))
	}
	const fnAction = alr.length || tmr.length ? action : null
	// стили
	const { cl, span, grid, cursor } = fnStyle(alr, tmr, show)
	console.log('alarm bar')
	return (
		<>
			<nav
				className={cl}
				onClick={fnAction}
				style={{ gridTemplateRows: `${grid}`, cursor: cursor }}
			>
				{!!alr?.length && alr.map((el, idx) => <Item key={idx} data={el} show={show} />)}

				{!!tmr?.length && (
					<span>
						<pre>
							Таймер <span className={span}>{'запретов'}</span>
						</pre>
					</span>
				)}

				{!!tmr?.length && tmr.map((el, idx) => <Item key={idx} data={el} show={show} />)}
			</nav>
		</>
	)
}

function fnStyle(alr, tmr, show) {
	// Стили
	let cl = ['nav indi']
	let span = ['indi-span']
	let grid = ''
	const cursor = alr.length || tmr.length ? 'pointer' : ''
	if (show) {
		cl.push('indi-show')
		span.push('indi-span-active')
	}
	cl = cl.join(' ')
	span = span.join(' ')
	if (alr.length) grid += `repeat(${alr.length}, var(--fsz40)) `
	if (tmr.length) grid += `var(--fsz30) repeat(${tmr.length ?? 0}, var(--fsz40)) `

	return { cl, span, grid, cursor }
}
