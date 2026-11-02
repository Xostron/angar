import { useEffect, useReducer, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTimeStore } from '@store/time'
import { posNow, posDate, posTime, posZoneLabel } from '@tool/datetime'
import './style.css'
const CLICK = 3
const DELTA_MS = 1000
// Текущее время POS (интерфейс может быть открыт не на POS — показываем время POS)
export default function Time({}) {
	const [data, setData] = useReducer(reducer, { count: 0 })
	const [now, setNow] = useState(posNow)
	const navigate = useNavigate()
	// Время и зона POS приходят в раме c_equip (apiInfo) по сокету
	const timezone = useTimeStore((s) => s.timezone)
	const offset = useTimeStore((s) => s.offset)
	const zone = posZoneLabel(timezone, offset)

	useEffect(() => {
		const timer = setInterval(() => setNow(posNow()), 1000)
		return () => clearInterval(timer)
	}, [])

	useEffect(() => {
		if (!data.ok) return
		navigate('./service/1')
	}, [data])

	return (
		<div
			className='time'
			onClick={setData}
			title={zone ? 'Время POS: ' + zone : 'Время POS'}
		>
			<span>{posTime(now)}</span>
			<span>{posDate(now)}</span>
		</div>
	)
}


/**
 *
 * @param {*} prev Предыдущее состояние
 * @param {*} action Входные данные
 * @returns Текущее состояние
 */
function reducer(prev) {
	// фиксация времени при первом нажатии
	if (!prev.count) prev.date = new Date()
	prev.count++

	// Проверка кол-ва нажатий
	if (prev.count < CLICK) return prev

	// Кол-во нажатий сделано -> проверка времени
	const time = new Date() - prev.date
	// Проверка пройдена -> переход на страницу Сервиса
	if (time <= DELTA_MS) return { ...prev, ok: true }
	// Не пройдена -> обнуляем кол-во нажатий
	prev.count = 0
	prev.date = undefined
	return prev
}
