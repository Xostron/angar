// Задержка при запуске питания
// После отключения 30 минут можно не реагировать продолжаем как обычно
// Далее 30 минут ожидания
// true - Можно продолжать
// false - Останавливаем работу
const { compareTime } = require('@tool/command/time')
const { data: store } = require('@store')
const { isExtralrm } = require('@tool/message/extralrm')

function supply(idB, clrId, idsS, retain) {
	// Время ожидания между запуском и отключением питания
	const timeH = 60 * 60000
	const time = 20 * 60000
	// const time = 30 * 60000
	// Получаем время последнего запуска и выключения из retain
	const doc = retain?.[idB]?.supply?.[clrId] ?? {}
	// Сохраняем в аккумулятор, он потом сохраняется в retain
	store.supply[idB] ??= {}
	store.supply[idB][clrId] = doc
	// console.log('\tПитание:, doc', doc)
	// if (!state) return false
	const noSupplyIds = idsS?.some((id) => isExtralrm(idB, id, 'supply'))
	const noSupply =
		isExtralrm(idB, null, 'supply') || isExtralrm(idB, null, 'battery') || noSupplyIds
	console.log(
		'\t Нет питания nosupply=',
		noSupply,
		'=',
		isExtralrm(idB, null, 'supply'),
		isExtralrm(idB, null, 'battery'),
		noSupplyIds
	)

	// Питание отключено
	if (noSupply) {
		// Питание было отключено. Обновляем время
		if (!doc.off) {
			// Обновляем время + записать в retain
			doc.off = new Date()
			doc.on = null
		}
		// console.log(
		// 	'\t\tПитание отключено в',
		// 	doc?.off?.toLocaleString(),
		// 	'Проверка:',
		// 	compareTime(new Date(doc.off), time)
		// )
		// Проверка времени
		return false
	}
	// Питание включили
	// Обновляем время включения
	if (!doc.on) doc.on = new Date()
	// Первый запуск, питание в норме
	if (!doc.off) {
		// console.log('Питание в норме c ', doc.on?.toLocaleString())
		return true
	}
	// Питания дали раньше дельты. или вышло время ожидания
	if (!compareTime(new Date(doc.off), timeH) || compareTime(new Date(doc.on), time)) {
		// console.log('\t\tПитание дали раньше ')
		// Обнуляю время отключения
		doc.off = null
		return true
	}
	// console.log(
	// 	'\t\tПитание дали в ',
	// 	doc.on,
	// 	' ожидаем проверку ',
	// 	compareTime(new Date(doc.on), time)
	// )
	return false
}

module.exports = supply
