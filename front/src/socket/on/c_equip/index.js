import { useEffect } from 'react'
import { socket } from '@socket/index'

/**
 * Запуск сокета и событий
 * @returns
 */
export default function cEquip(add) {
	useEffect(() => {
		const a = (val) => equip(add, val)
		socket.on('c_equip', a)

		return () => {
			socket.off('c_equip', a)
		}
	})
}

function equip(add, val) {
	console.log(99001,new Date().toLocaleString(), 'Клиент подключился к серверу, рама получена', val)
	add(val)
}
