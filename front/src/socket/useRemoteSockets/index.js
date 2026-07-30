import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import useEquipStore from '@store/equipment';
import useRemoteStore from '@store/remote';

const config = {
	reconnectionDelay: 5000,
	reconnectionDelayMax: 5000,
	autoConnect: true,
};

/**
 * Хук: Управление сокет-подключениями к удалённым устройствам.
 * Следит за списком remote в store, добавляет/удаляет сокеты по IP,
 * подписывается на c_input и сохраняет bCard разрешённых складов в remoteStore.
 */
export default function useRemoteSockets() {
	const remote = useEquipStore((s) => s.remote);
	const remoteRef = useRef(remote);
	const socketsRef = useRef(new Map());

	useEffect(() => {
		const prev = remoteRef.current;
		const prevMap = new Map(prev?.map((el) => [el.ip, el]) ?? []);
		const nextMap = new Map(remote?.map((el) => [el.ip, el]) ?? []);
		const sockets = socketsRef.current;

		// Удалить сокеты для IP, которых нет в новом списке
		for (const [ip] of prevMap) {
			if (!nextMap.has(ip) && sockets.has(ip)) {
				const s = sockets.get(ip);
				const device = prevMap.get(ip);
				s.disconnect();
				s.removeAllListeners();
				sockets.delete(ip);
				useRemoteStore.getState().removeByIp(ip);
				useRemoteStore
					.getState()
					.setStatus(device._id, null, 'Удалено из списка');
				console.log('Remote socket отключён:', ip);
			}
		}

		// Добавить сокеты для новых IP
		for (const [ip, device] of nextMap) {
			if (!sockets.has(ip)) {
				const allowedBuildings = (device.buildings ?? []).map(
					(b) => b._id,
				);
				const s = createSocket(ip, device._id, allowedBuildings);
				sockets.set(ip, s);
			}
		}

		remoteRef.current = remote;
	}, [remote]);

	// Очистка при размонтировании
	useEffect(() => {
		return () => {
			for (const [ip, s] of socketsRef.current) {
				s.disconnect();
				s.removeAllListeners();
			}
			socketsRef.current.clear();
		};
	}, []);
}

function createSocket(ip, deviceId, allowedBuildings) {
	const store = useRemoteStore.getState();

	store.setStatus(deviceId, null, 'Подключение...');

	const s = io(`http://${ip}:4000`, config);

	s.on('connect', () => {
		useRemoteStore
			.getState()
			.setStatus(deviceId, true, `Подключено (id: ${s.id})`);
		console.log('Remote socket подключён:', ip, s.id);
	});

	s.on('disconnect', (reason) => {
		useRemoteStore
			.getState()
			.setStatus(deviceId, false, `Отключено: ${reason}`);
		console.log('Remote socket разорван:', ip, reason);
	});

	s.on('connect_error', (err) => {
		useRemoteStore
			.getState()
			.setStatus(deviceId, false, `Ошибка: ${err.message}`);
		console.log('Remote socket ошибка:', ip, err.message);
	});

	s.on('c_input', (data) => {
		// console.log(`Remote c_input от ${ip}:`, data?.bCard ? `keys: ${Object.keys(data.bCard)}` : 'нет bCard', 'allowed:', allowedBuildings)
		if (data?.bCard) {
			useRemoteStore
				.getState()
				.setBCard(ip, deviceId, data.bCard, allowedBuildings);
		}
	});

	return s;
}
