const { data: store, setToMan, setToAuto } = require('@store')
const { controlM } = require('./fn')
const {getB} = require('@tool/command/building')

/* Переход в ручной режим
Остановка клапанов, все остальное продолжает работать
*/
function toMan(obj) {
	const { data, value, retain } = obj
	// Секция склада
	for (const el of data.section) {
		const idB = el?.buildingId
		const type = getB(data.building, idB)?.type
		if (type!=='normal') continue 
		// Секция в ручном
		const isMan = retain?.[idB]?.mode?.[el._id] === false ? true : false
		// Подготовка уже выполнена
		const isDone = store.toMan?.[idB]?.[el._id]
		// Секция не в ручном режиме - сброс готовности руч режима и выходим
		if (!isMan) {
			setToMan({ _build: idB, _section: el._id, value: false })
			continue
		}
		// Подготовка уже выполнена - выходим
		if (isDone) continue
		console.log('Подготовка к ручному секции', el.name)
		// Подготовка - останов клапанов
		controlM(idB, el._id, data, value)
	}
}

module.exports = toMan
