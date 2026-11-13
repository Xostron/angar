import api from './config'
import { uri } from '@store/uri'

/**
 * Получить данные для 4 графиков отчёта
 * @param {string} bldId — ID склада
 * @param {number} [days=7] — период в днях (1–14)
 * @returns {Promise<{temperature, humidity, valve, fan}>}
 */
export function getCharts(bldId, days = 7) {
	return api({
		method: 'GET',
		url: 'web/report/charts',
		baseURL: `http://${uri}:4000/api/`,
		params: { bldId, days },
		timeout: 30000,
	}).then((r) => r.data)
}

/**
 * Получить детальные данные датчиков (сгруппированы по id+name)
 * @param {string} bldId — ID склада
 * @param {'tprd'|'hin'} type — тип датчика
 * @param {number} [days=7] — период в днях (1–14)
 * @returns {Promise<Array<{id: string, name: string, data: number[][]}>>}
 */
export function getSensorChart(bldId, type, days = 7) {
	return api({
		method: 'GET',
		url: 'web/report/sensors',
		baseURL: `http://${uri}:4000/api/`,
		params: { bldId, type, days },
		timeout: 30000,
	}).then((r) => r.data)
}
