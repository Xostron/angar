import api from './config'

/**
 * Запрос записей действий пользователей
 * @param {number} [page=1] Номер страницы
 * @param {number} [limit=50] Записей на страницу
 * @param {string} [from] Начало диапазона (ISO)
 * @param {string} [to] Конец диапазона (ISO)
 * @returns {Promise<{ items: object[], total: number, page: number, limit: number }>}
 */
export function getActivity(page = 1, limit = 50, from, to, bldId, secId) {
	const params = { page, limit }
	if (from) params.from = from
	if (to) params.to = to
	if (bldId) params.bldId = bldId
	if (secId) params.secId = secId
	return api
		.get('web/activity', { params })
		.then((r) => r.data)
}
