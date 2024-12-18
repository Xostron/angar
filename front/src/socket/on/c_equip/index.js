import { useEffect } from 'react';
import { socket } from '@socket/index';

/**
 * Запуск сокета и событий
 * @returns
 */
export default function cEquip(add) {
	useEffect(() => {
		const a = (val) => equip(add, val);
		socket.on('c_equip', a);

		return () => {
			socket.off('c_equip', a);
		};
	});
}

// обработчик события
function equip(add, val) {
	add(val);
	// console.log('socket_io c_equip', val);
}
