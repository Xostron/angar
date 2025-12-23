const { convertPC, convertSec, convertTenta, deltaTol } = require('../fn')
const transformStore = require('@routes/api/tenta/read/store/transform')
const transformPC = require('@routes/api/tenta/read/pc/transform')
const { data: store, dataDir } = require('@store')
const tolerance = require('../fn/tolerance.json')
const { readTO } = require('@tool/json')
const fsp = require('fs').promises

/**
 * API GET State: для запросов от Tenta
 * Подготовка state для Админ-сервера (с учетом delta-дребезга и расчета delta-изменений)
 * @param {string} type init - Сервер запрашивает полный набор данных
 * @returns
 */
module.exports = async function prepareRes(type) {
	const past = store.past // Предыдущее состояние ангара (Вторичная - составные ключи)
	let present = {}, // Актуальное состояние ангара (Вторичная - составные ключи)
		diffing, // delta-изменения (Вторичная - составные ключи)
		result // ответ для Админки
	const raw = store.value // Актуальное состояние ангара (первичная форма)
	try {
		// Рама pc
		const files = (await fsp.readdir(dataDir)).filter((el) => el.includes('json'))
		const data = await readTO(files)
		// Датчики id с допусками из tolerance.json
		const sens = {}
		data.sensor.forEach((el) => (sens[el._id] = tolerance[el.type]))

		// Если данных по ангару нет
		if (!Object.keys(raw).length) {
			console.log('\x1b[33m%s\x1b[0m', 'Запрос state от Admin: Данные от ЦС еще не готовы')
			return null
		}

		// Мясо - Карточки PC
		const resPC = transformPC(raw, data.building, data.section, data.fan)
		// Мясо - Полное содержимое секции и карточки секций
		for (const sec of data.section)
			present[sec._id] = await transformStore(sec.buildingId, sec._id)
		// Актуальные данные
		present = { ...convertPC(resPC), ...convertSec(present) }
		// delta-изменения:
		diffing = !past || type === 'init' ? null : deltaTol(present, past, sens, tolerance)
		// Формируем данные для Admin: источник diffing (изменения) или present (полные данные)
		result = convertTenta(diffing ?? present, data.pc._id)

		// Фиксируем изменения
		store.past =
			diffing === null ? present  : { ...store.past, ...diffing }
		return { result, present }
	} catch (error) {
		console.error('\x1b[33m%s\x1b[0m', 'Запрос state от Админ: ❌Ошибка', error)
	}
}
