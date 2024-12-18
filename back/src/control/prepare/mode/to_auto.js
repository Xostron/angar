const { data: store, setToAuto } = require('@store')
const { controlAO, controlM } = require('./fn')
const {getB} = require('@tool/command/building')

/* Переход в авто режим - подготовка:
    Отключение выходов секции,
    Закрытие клапанов
*/
function toAuto(obj) {
	const { data, value, retain } = obj
	// Секция склада
	for (const el of data.section) {
		const idB = el?.buildingId
		const type = getB(data.building, idB)?.type
		if (type!=='normal') continue 
		// Секция в авто
		const isAuto = retain?.[idB]?.mode?.[el._id]
		// Подготовка уже выполнена
		const isDone = store.toAuto?.[idB]?.[el._id]
		// Секция не в авто режиме - выходим
		if (!isAuto) {
			setToAuto({ _build: idB, _section: el._id, value: false })
			continue
		}

		// Подготовка уже выполнена - выходим
		if (isDone) continue
		console.log('Подготовка к авто секции', el.name, isDone)
		// Подготовка - команда на закрытие клапанов
		controlAO(idB, el._id, data, value)
	}
}

module.exports = toAuto
