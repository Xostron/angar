import api from './config';

/**
 * Запрос исторических данных по timestamp
 * @param {Date} ts Дата/время запроса
 * @returns {{ input, equip, alarm, ts }}
 */
export function getHistory(ts) {
	return api
		.get('web/history', { params: { ts: ts.toISOString() } })
		.then((r) => r.data);
}

/**
 * Очистка всех коллекций истории
 * @returns {{ ok, removed: { alarm, input, equip } }}
 */
export function clearHistory() {
	return api.delete('web/history').then((r) => r.data);
}
