import { useEffect } from 'react'
import { socket } from '@socket/index'

/**
 * Запуск сокета и событий
 * @returns
 */
export default function cAlarm(initAlr) {
	useEffect(() => {
		const a = (data) => input(initAlr, data)
		socket.on('c_alarm', a)

		return () => {
			socket.off('c_alarm', a)
		}
	})
}

// Обработчик события
function input(initAlr, data) {
	initAlr(data)
	// console.log('socket_io c_alarm', data)
}
