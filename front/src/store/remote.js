import { create } from 'zustand';

const useRemoteStore = create((set, get) => ({
	// [buildingId]: { ...bCardData, ip, deviceId }
	buildings: {},
	// [deviceId]: {status: null|true||False, description: 'Подключение||На связи|| Нет связи'}
	devices: {},

	// Сохранить bCard от устройства (только склады из remote[i].buildings)
	setBCard(ip, deviceId, bCard, allowedBuildings) {
		if (!bCard || !allowedBuildings?.length) {
			console.log('setBCard пропущен: нет bCard или allowedBuildings', { ip, deviceId, hasBCard: !!bCard, allowedBuildings })
			return;
		}
		set((state) => {
			const next = { ...state.buildings };
			let changed = false;
			for (const bId of allowedBuildings) {
				if (bCard[bId] !== undefined) {
					const old = next[bId];
					const fresh = bCard[bId];
					// Сравниваем данные — обновляем только если что-то изменилось
					if (
						!old ||
						old.ip !== ip ||
						old.deviceId !== deviceId ||
						JSON.stringify(old) !== JSON.stringify({ ...fresh, ip, deviceId })
					) {
						next[bId] = { ...fresh, ip, deviceId };
						changed = true;
					}
				} else {
					console.log(`setBCard: bCard[${bId}] === undefined, ключи bCard:`, Object.keys(bCard))
				}
			}
			if (!changed) { console.log('setBCard: нет изменений', { ip, deviceId }); return state; }
			console.log('setBCard: данные обновлены', { ip, deviceId, buildings: Object.keys(next) })
			return { buildings: next };
		});
	},

	// Удалить все склады устройства по ip
	removeByIp(ip) {
		set((state) => {
			const next = {};
			for (const [bId, data] of Object.entries(state.buildings)) {
				if (data.ip !== ip) next[bId] = data;
			}
			return { buildings: next };
		});
	},

	// Установить статус устройства
	// status: null - попытка подключения, true - на связи, false - нет связи
	setStatus(deviceId, status, description = '') {
		set((state) => ({
			devices: {
				...state.devices,
				[deviceId]: {
					...state.devices[deviceId],
					status,
					description,
				},
			},
		}));
	},

	// Получить статус устройства
	getStatus(deviceId) {
		return get().devices?.[deviceId]?.status ?? null;
	},

	// Получить все устройства с их статусами
	getDevices() {
		return get().devices;
	},

	// Получить bCard склада по id
	getBCard(buildingId) {
		if (!buildingId) return null;
		const obj = get().buildings?.[buildingId];
		if (!obj) return null;
		const device = get().devices?.[obj.deviceId];
		return { ...obj, device };
	},

	// Получить все bCard
	getAll() {
		return get().buildings;
	},

	// Получить все bCard конкретного устройства по ip
	getByIp(ip) {
		const result = {};
		for (const [bId, data] of Object.entries(get().buildings)) {
			if (data.ip === ip) result[bId] = data;
		}
		return result;
	},
}));

export default useRemoteStore;
