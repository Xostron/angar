import Moment from 'react-moment'
import './style.css'
import { useEffect, useReducer, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
const CLICK = 5
const DELTA_MS = 800
//Текущее время
export default function Time({}) {
	const [data, setData] = useReducer(reducer, { count: 0 })
	const navigate = useNavigate()
	useEffect(() => {
		if (!data.ok) return
		navigate('./service')
	}, [data])
	return (
		<div className='time' onClick={setData}>
			<Moment format='HH:mm' interval={1000} />
			<Moment format='DD.MM.YYYY' interval={1000} />
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
