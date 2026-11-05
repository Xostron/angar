import Cell from './cell'
import { useState, useRef, useEffect } from 'react'

//Строка настроек
export default function Row({ data, i }) {
	// console.log(data)
	// console.log(333, refresh)
	// const prevListRef = useRef(data)
	// useEffect(() => {
	// 	if (prevListRef.current === data) {
	// 		console.log('⚠️ ССЫЛКА НЕ ИЗМЕНИЛАСЬ! React думает, что это тот же массив.', data)
	// 	} else {
	// 		console.log('✅ ССЫЛКА ИЗМЕНИЛАСЬ! Это абсолютно новый массив в памяти.', data)
	// 	}
	// 	// Обновляем реф для следующей проверки
	// 	prevListRef.current = data
	// }, [data])

	return (
		<>
			{data.map((el, j) => (
				// key={el?.code + '.' + el?.value}
				<Cell key={el?.code ?? j} i={i} j={j} data={el} />
			))}
		</>
	)
}
