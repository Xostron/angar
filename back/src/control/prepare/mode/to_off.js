const { data: store, setToOffSection } = require('@store')
const { controlAO, controlM, offEq } = require('./fn')
const {getB} = require('@tool/command/building')

/* Переход секции в выкл
Остановка клапанов, все остальное продолжает работать
*/
function toOff(obj) {
	const { data, value, retain } = obj
	// Секция склада
	for (const el of data.section) {
		const idB = el?.buildingId
		const type = getB(data.building, idB)?.type
		if (type!=='normal') continue 
		// Секция в авто
		const isOff = retain?.[idB]?.mode?.[el._id] === null ? true : false
		// Подготовка уже выполнена
		const isDone = store.toOffSection?.[idB]?.[el._id]
		// Секция не выключена - выходим
		if (!isOff) {
			setToOffSection({ _build: idB, _section: el._id, value: false })
			continue
		}
		// Подготовка уже выполнена - выходим
		if (isDone) continue
		// Процесс выключения секции
		console.log('Подготовка к выкл секции', el.name)
		controlAO(idB, el._id, data, value, 'to_off')
	}
}

module.exports = toOff
