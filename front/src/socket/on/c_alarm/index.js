import { useEffect } from 'react'
import { socket } from '@socket/index'
import useHistoryStore from '@store/history'

/**
 * Запуск сокета и событий
 * @returns
 */
export default function cAlarm(initAlr) {
	useEffect(() => {
		const a = (data) => {
			if (useHistoryStore.getState().active) return
			initAlr(data)
		}
		socket.on('c_alarm', a)

		return () => {
			socket.off('c_alarm', a)
		}
	})
}
