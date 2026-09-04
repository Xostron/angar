import { useEffect } from 'react'
import { socket } from '@socket/index'
import useHistoryStore from '@store/history'

/**
 * Запуск сокета и событий
 * @returns
 */
export default function cInput(initIn) {
	useEffect(() => {
		const a = (val) => {
			if (useHistoryStore.getState().active) return
			initIn(val)
		}
		socket.on('c_input', a)

		return () => {
			socket.off('c_input', a)
		}
	})
}
