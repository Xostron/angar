import { useEffect } from 'react'
import { socket } from '@socket/index'
import useOutputStore from '@store/output'
import { useShallow } from 'zustand/react/shallow'
/**
 * Запуск сокета и событий
 * @returns
 */
export default function cWarm() {
	const [delWarming] = useOutputStore(useShallow(({ delWarming }) => [delWarming]))
	useEffect(() => {
		const a = (data) => fn(data, delWarming)
		socket.on('c_warm', a)

		return () => {
			socket.off('c_warm', a)
		}
	})
}

// Обработчик события
function fn(data, cb) {
	cb(data)
	// console.log('socket_io c_alarm', data)
}
