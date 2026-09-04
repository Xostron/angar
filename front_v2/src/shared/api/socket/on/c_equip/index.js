import { useEffect } from 'react';
import { socket } from '@socket/index';
import useHistoryStore from '@store/history';

/**
 * Запуск сокета и событий
 * @returns
 */
export default function cEquip(add) {
	useEffect(() => {
		const a = (val) => {
			if (useHistoryStore.getState().active) return;
			console.log(99001, new Date().toLocaleString(), 'Клиент подключился к серверу, рама получена', val);
			add(val);
		};
		socket.on('c_equip', a);

		return () => {
			socket.off('c_equip', a);
		};
	});
}
