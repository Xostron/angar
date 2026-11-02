import { create } from 'zustand'

/**
 * Время POS-сервера.
 *
 * Интерфейс может быть открыт не на POS (ноутбук, удалённый доступ),
 * поэтому все отметки времени в интерфейсе показываем в зоне POS,
 * а часы тикают по времени POS, а не клиента.
 *
 * Время и зона POS приходят в раме оборудования (c_equip.apiInfo) по сокету —
 * отдельный запрос за временем не нужен.
 *
 * offset   — смещение зоны POS относительно UTC в минутах
 *            (как Date#getTimezoneOffset: UTC+4 -> -240)
 * timezone — имя зоны POS (например, Europe/Astrakhan)
 * delta    — разница «время POS − время клиента» в мс
 */
const useTimeStore = create((set, getState) => ({
	offset: null,
	timezone: null,
	delta: 0,
	synced: false,
	lastSync: 0,

	/**
	 * Обновление времени POS из рамы c_equip (поле apiInfo)
	 * @param {Object} apiInfo Информация о сервере POS
	 * @param {Date|number|string} [apiInfo.date] Дата формирования рамы на POS
	 * @param {number} [apiInfo.offset] Смещение зоны POS в минутах
	 * @param {string} [apiInfo.timezone] Имя зоны POS
	 * @returns {void}
	 */
	init: (apiInfo) => {
		if (!apiInfo) return
		const prev = getState()
		const offset =
			apiInfo.offset === null || apiInfo.offset === undefined
				? NaN
				: Number(apiInfo.offset)
		const ts = apiInfo.date ? new Date(apiInfo.date).getTime() : NaN
		set({
			offset: Number.isFinite(offset) ? offset : prev.offset,
			timezone: apiInfo.timezone ?? prev.timezone,
			// Время POS соответствует моменту формирования рамы на сервере
			delta: Number.isFinite(ts) ? ts - Date.now() : prev.delta,
			synced: true,
			lastSync: Date.now(),
		})
	},
}))

/**
 * Смещение зоны POS относительно UTC в минутах (как Date#getTimezoneOffset)
 * @returns {number|null} null — зона POS ещё не известна
 */
const posOffsetMin = () => useTimeStore.getState().offset

/**
 * Текущее время POS в мс
 * @returns {number}
 */
const posNow = () => Date.now() + useTimeStore.getState().delta

// export default useTimeStore
export { posOffsetMin, posNow, useTimeStore }
