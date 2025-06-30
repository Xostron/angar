const { convertPC, convertSec, convertTenta, fnDiffing } = require('./fn')
const transformStore = require('@routes/api/tenta/read/store/transform')
const transformPC = require('@routes/api/tenta/read/pc/transform')
const { data: store, dataDir } = require('@store')
const data = require('./delta/data.json')
const { readTO } = require('@tool/json')
const fsp = require('fs').promises

// Подготовка ответа (state) для сервера (с учетом delta-дребезга и расчета delta-изменений)
async function reconciliation() {
	const past = store.past // Предыдущее состояние ангара (Вторичная - составные ключи)
	let present = {}, // Актуальное состояние ангара (Вторичная - составные ключи)
		diffing, // delta-изменения (Вторичная - составные ключи)
		result // ответ для Админки
	const raw = store.value // Актуальное состояние ангара (первичная форма)

	// Рама pc
	const files = (await fsp.readdir(dataDir)).filter((el) => el.includes('json'))
	const data = await readTO(files)

	// Если данных по ангару нет
	if (!Object.keys(raw).length) {
		console.log('\x1b[33m%s\x1b[0m', 'Данные от ЦС еще не готовы')
		return null
	}

	// Мясо - Карточки PC
	const resPC = transformPC(raw, data.building, data.section, data.fan)
	// Мясо - Полное содержимое секции и карточки секций
	for (const sec of data.section) present[sec._id] = await transformStore(sec.buildingId, sec._id)

	present = { ...convertPC(resPC), ...convertSec(present) }
	diffing = past ? fnDiffing(present, past, tolerance) : null

	// Формируем данные для Tenta
	result = convertTenta(diffing ?? present, data.pc._id)
	return { result, present }
}

module.exports = reconciliation
