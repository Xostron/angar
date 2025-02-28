import { create } from 'zustand';
import invalid from '@tool/status/invalid_value';
import useEquipStore from '@store/equipment';
import { useShallow } from 'zustand/react/shallow';

// Данные от сервера: датчики, режимы, настройки
const useInputStore = create((set, get) => ({
	input: {
		// [sensorId]:...
		// [valveId]:...
		// [fanId]:...
		// [factory]:...
		// [output]:...
		// [retain]:...
	},
	alarm: {},
	// Инициализация входов
	initIn: (r) => {
		return set({ input: r });
	},
	// Аварийные сообщения
	initAlr: (r) => {
		return set({ alarm: r });
	},
	// Получить значение сигнала (концевик, обр связь вентилятора)
	getSignal(id) {
		const signal = get()?.input?.[id];
		return signal;
	},

	// Получить готовое значение с датчика (с коррекцией)
	getValue(sensorId) {
		const input = get().input;
		return input?.[sensorId]?.value ?? null;
	},
	getVal(sensorId) {
		const input = get().input;
		return input?.[sensorId];
	},
	getRaw(sensorId) {
		const input = get().input;
		return input?.[sensorId]?.raw;
	},
	// Получить мин, макс
	getMinMax(arrSens, info = []) {
		const n = [
			{ ...info[0], value: null },
			{ ...info[1], value: null },
		];
		if (!arrSens) return n;
		const result = [];
		for (const o of arrSens) {
			const value = get().getValue(o?._id);
			if (value == null) continue;
			result.push(value);
		}
		if (result.length === 1) {
			return [
				{ ...info[0], value: result?.[0] },
				{ ...info[1], value: result?.[0] },
			];
		}
		// сортировка по возрастанию
		result.sort((a, b) => a - b);
		return [
			{ ...info[0], value: result?.[0] },
			{ ...info[1], value: result?.[result.length - 1] },
		];
	},
	// Получить раму датчика и его значение min или max
	getValueGr(arrSens, type, max = false) {
		if (!arrSens) return { value: null, type };
		const input = get().input;
		const r = arrSens
			?.map((el) => ({ ...el, ...input?.[el?._id] }))
			?.filter((el) => el?.on === true)
			?.sort((a, b) => a.value - b.value);
		if (max) return r[r.length - 1];
		return r[0];
	},
	getTotalBy(key, type, id) {
		const o = get()?.input?.total?.[id]?.[key];
		// console.log(222, key, type, get()?.input?.total);
		return { state: o?.state, value: o?.[type] };
	},
	getTotal(key, type) {
		const o = get()?.input?.total?.[key];
		return { state: o?.state, value: o?.[type] };
	},
	getFan(fan) {
		return { ...fan, state: get()?.input?.[fan?._id]?.state };
	},
	factory: () => get()?.input?.factory?.setting,
	// Процент открытия клапана
	posV(vlvId, buildId) {
		const retain = get().input.retain;
		// время открытия клапана (калибровка)
		const f = retain?.[buildId]?.valve?.[vlvId] ?? 1;
		// Текущая позиция клапана, мс
		const t = retain?.[buildId]?.valvePosition?.[vlvId] ?? 0;
		// Текущая позиция (%)
		return ((t * 100) / f)?.toFixed(0);
	},
	// Cостояние клапана
	stateV(vlvId) {
		if (!vlvId) return null;
		const input = get().input;
		const output = get().input.outputEq;
		const opn = input?.[vlvId]?.open;
		const cls = input?.[vlvId]?.close;
		const iopn = output?.[vlvId]?.open;
		const icls = output?.[vlvId]?.close;
		if ((opn && cls) || (iopn && icls)) return 'alr';
		if (!opn && !cls && !iopn && !icls) return 'popn';
		if (iopn) return 'iopn';
		if (icls) return 'icls';
		if (opn) return 'opn';
		if (cls) return 'cls';
	},
	automode(buildingId) {
		return get().input?.retain?.[buildingId]?.automode;
	},
	// Вернуть массив аварий-баннеров для склада
	bannerB(idB, code) {
		if (!idB) return [];
		const arr = [];
		const connect = get()?.alarm?.banner?.connect?.[idB];
		const local = get()?.alarm?.banner?.local?.[idB]?.[idB];
		const smoking = get()?.alarm?.banner?.smoking?.[idB];
		connect ? arr.push(connect) : null
		local ? arr.push(local):null
		smoking ? arr.push(smoking):null
		return arr;
	},
	// Вернуть массив аварий-баннеров для секции
	bannerS(idB, idS) {
		if (!idB || !idS) return [];
		const arr = [];
		const connect = get()?.alarm?.banner?.connect?.[idB];
		const local = get()?.alarm?.banner?.local?.[idB]?.[idS] ?? get()?.alarm?.banner?.local?.[idB]?.[idB];
		const smoking = get()?.alarm?.banner?.smoking?.[idB];
		console.log(222, local)
		connect ? arr.push(connect) : null
		local ? arr.push(local):null
		smoking ? arr.push(smoking):null
		return arr;
	},
}));

export default useInputStore;
