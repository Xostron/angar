const { convertPC, convertSec, convertTenta } = require('@tool/state/fn')
const transformStore = require('@routes/api/tenta/read/store/transform')
const transformPC = require('@routes/api/tenta/read/pc/transform')
const { data: store, dataDir } = require('@store')
const tolerance = require('../fn/tolerance.json')
const { readTO } = require('@tool/json')
const deltaTol = require('../fn/delta')
const fsp = require('fs').promises
/**
 * POS -> Tenta
 * Формирование state (значения данных по PC)
 * @returns {object}	result Данные по датчикам (для Tenta админки),
 * 						hub: {init:date, last:date, state:object}
 * 							init Инициализация пройдена,
 * 							last Предыдущая передача данных прошла успешна
 * 							state Данные по датчикам (предыдущее состояние)
 * 						present Данные по датчикам (для расчета delta)
 */
module.exports = async function prepareReq() {
	const hub = store.hub //Аккумулятор прошлых значений
	let present = {}, // Актуальное состояние ангара (Вторичная - составные ключи)
		diffing, // delta-изменения (Вторичная - составные ключи)
		result // ответ для Админки

	try {
		// Рама pc
		const files = (await fsp.readdir(dataDir)).filter((el) => el.includes('json'))
		const data = await readTO(files)

		// Настройка в админке: Получение данных от ЦС (вкл/выкл : true/false)
		// TODO - отключено для сервера ангара, чтобы у нас всегда формировался какой-либо state
		// if (!data?.pc?.state?.on) {
		// 	console.log('\x1b[33m%s\x1b[0m', 'Получение данных от ЦС выключен')
		// 	return null
		// }

		// Собираем значения по складу
		if (!Object.keys(store.value).length) {
			// console.log('\x1b[33m%s\x1b[0m', 'Данные не готовы')
			return null
		}

		// Карточки PC
		const resPC = transformPC(store.value, data.building, data.section, data.fan)

		// Полное содержимое секции и карточки секций
		for (const sec of data.section)
			present[sec._id] = await transformStore(sec.buildingId, sec._id)

		// Актуальные данные - Преобразуем в одноуровневый объект с составными ключами
		present = { ...convertPC(resPC), ...convertSec(present) }

		// Расчет delta (первый пул данных успешно hub.init = true)
		// Датчики id с допусками из tolerance.json
		const sens = {}
		data.sensor.forEach((el) => (sens[el._id] = tolerance[el.type]))
		diffing = hub.init ? deltaTol(present, hub.state, sens, tolerance) : null
		// console.log(8806, 'Изменения', diffing, hub.init, hub.last, hub.state)
		// Формируем данные для Tenta: изменения или полные данные
		result = convertTenta(diffing ?? present, data.pc._id)
		return { result, hub, present, diffing }
	} catch (error) {
		console.error('\x1b[33m%s\x1b[0m', 'POS->Tenta: 1. ❌Ошибка подготовки данных', error)
	}
}
