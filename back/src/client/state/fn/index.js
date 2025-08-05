const { convertPC, convertSec, convertTenta, delta } = require('@tool/state/fn')
const transformStore = require('@routes/api/tenta/read/store/transform')
const transformPC = require('@routes/api/tenta/read/pc/transform')
const { data: store, dataDir } = require('@store')
const { readTO } = require('@tool/json')
const fsp = require('fs').promises

/**
 *
 * @returns {object}	result Данные по датчикам (для Tenta админки),
 * 						hub: {init:boolean, last:boolean, state:object}
 * 							init Инициализация пройдена,
 * 							last Предыдущая передача данных прошла успешна
 * 							state Данные по датчикам (предыдущее состояние)
 * 						present Данные по датчикам (для расчета delta)
 */
async function preparing() {
	const hub = store.hub //Аккумулятор
	let present = {}, // Актуальное состояние ангара (Вторичная - составные ключи)
		diffing, // delta-изменения (Вторичная - составные ключи)
		result // ответ для Админки
	const raw = store.value // Актуальное состояние ангара (первичная форма)
	
	// Рама pc
	const files = (await fsp.readdir(dataDir)).filter((el) => el.includes('json'))
	const data = await readTO(files)

	// Получение данных от ЦС (вкл/выкл : true/false)
	if (!data?.pc?.state?.on) {
		console.log('\x1b[33m%s\x1b[0m', 'Получение данных от ЦС выключен')
		return null
	}
	// Собираем значения по складу
	if (!Object.keys(raw).length) {
		console.log('\x1b[33m%s\x1b[0m', 'Данные от ЦС еще не готовы')
		return null
	}

	// Карточки PC
	const resPC = transformPC(raw, data.building, data.section, data.fan)
	// Полное содержимое секции и карточки секций
	for (const sec of data.section) present[sec._id] = await transformStore(sec.buildingId, sec._id)

	// Преобразуем в одноуровневый объект с составными ключами
	present = { ...convertPC(resPC), ...convertSec(present) }

	// Расчет delta (первое включение прошло успешно hub.init = true)
	diffing = hub.init ? delta(present, hub.state) : null

	// Формируем данные для Tenta
	result = convertTenta(diffing ?? present, data.pc._id)
	return { result, hub, present }
}

module.exports = preparing
