import { useEffect } from 'react'
import { socket } from '@socket/index'
import useSocketStore from '@store/socket'

/**
 * Хук: Запуск сокета и событий
 * @returns
 */
export default function useSocket() {
	const updateOn = useSocketStore((s) => s.updateOn)

	useEffect(() => {
		// происходит при подключении / повторном подключении
		socket.on('connect', connect)
		// происходит при отключении
		socket.on('disconnect', disconnect)
		// происходит при отказе в подключении, требуется ручное переподключение
		socket.on('connect_error', (error) => defEvent('connect_error', error))
		socket.io.on('ping', () => updateOn(true))
		socket.io.on('reconnect_failed', () => defEvent('reconnect_failed'))
		socket.io.on('reconnect_attempt', (attempt) => defEvent('reconnect_attempt', attempt))
		socket.io.on('reconnect_error', (error) => defEvent('reconnect_error', error))
		return () => {
			socket.off('connect', connect)
			socket.off('disconnect', disconnect)
			socket.off('connect_error', (error) => defEvent('connect_error', error))
			// удаляет все или указанные обработчики
			socket.removeAllListeners()
			// удаляет все или указанный обработчик
			socket.offAny()
		}
	}, [])

	function connect() {
		// По умолчанию при отсутствии подключения происходит буферизация данных. В некоторых случаях может потребоваться другое поведение.
		// очистка буфера перед повторным подключением
		socket.sendBuffer = []
		console.log('Соединение установлено', socket.id)
		updateOn(true)
	}

	function disconnect() {
		console.log('Соединение разорвано')
		updateOn(false)
	}

	function defEvent(name, doc) {
		console.log(new Date().toLocaleString(), 'Event:', name, doc)
	}
}
