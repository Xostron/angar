import { useParams } from 'react-router-dom'
import { useState, useRef } from 'react'
import useInputStore from '@store/input'
import Item from './item'
import {fnAlarm, fnAlarmB} from '../fn'
import './style.css'

//Панель управления - аварийные индикаторы
export default function AlarmBar({}) {
	const { build, sect } = useParams()
	const [show, setShow] = useState(false)
	const refClose = useRef()
	const bar = useInputStore((s) => s.alarm.bar)
	const barB = useInputStore((s) => s.alarm.barB)
	const timer = useInputStore((s) => s.alarm.timer)
	// Аварии для панели
	let r
	if (sect) r = fnAlarm(build, sect, bar, timer)
	else r = fnAlarmB(build, barB, timer)
	const { alr, tmr } = r
	const cls = ['page-section-sidebar-alarm-mobile', show ? 'show' : ''].join(' ')
	const clsItem = ['item', show ? 'show' : ''].join(' ')

	return (
		<>
			<nav className={cls} onClick={onShow}>
				{/* Аварии авторежима, аварийное закрытие клапанов */}
				{!!alr?.length && alr.map((el, i) => <Item key={i} el={el} cls={clsItem} />)}
				{/* Таймер запретов */}
				{!!tmr?.length && tmr.map((el, i) => <Item key={i} el={el} cls={clsItem} />)}
				{show && (
					<img
						ref={refClose}
						className='page-section-sidebar-alarm-mobile-close'
						src='/img/close.svg'
					/>
				)}
			</nav>
		</>
	)
	// Скрыть/показать
	function onShow(e) {
		if (e.target === refClose.current) return setShow(false)
		setShow(true)
	}
}

