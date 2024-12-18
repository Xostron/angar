import { useEffect } from 'react'
import { socket } from '@socket/index'

/**
 * Запуск сокета и событий
 * @returns
 */
export default function cInput(initIn) {
	useEffect(() => {
		const a = (val) => input(initIn, val)
		socket.on('c_input', a)

		return () => {
			socket.off('c_input', a)
		}
	})
}

// Обработчик события
function input(initIn, val) {
	initIn(val)
	// console.log('socket_io c_input', val)
}
