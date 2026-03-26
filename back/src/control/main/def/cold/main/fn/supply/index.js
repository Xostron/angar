// Задержка при запуске питания
// После отключения 30 минут можно не реагировать продолжаем как обычно
// Далее 30 минут ожидания
// true - Можно продолжать
// false - Останавливаем работу
const { compareTime, remTime } = require('@tool/command/time')
const { data: store } = require('@store')
const { isExtralrm } = require('@tool/message/extralrm')
const { msg } = require('@tool/message')
const { wrExtra, delExtra } = require('@tool/message/extra')
// Время ожидания между запуском и отключением питания
const timeH = 60 * 60000
const time = 20 * 60000

function checkSupply(bld, sect, clr, idsS, retain) {
	// Получаем время последнего запуска и выключения из retain
	const doc = retain?.[bld._id]?.supply?.[clr._id] ?? {}
	const r = supply(bld._id, clr._id, idsS, doc)
	if (r === -2)
		wrExtra(
			bld._id,
			sect._id,
			'checkSupply',
			msg(bld, sect, 42, `Комби-холодильник заблокирован. Осталось ${remTime(doc.on, time)}`),
		)
	else delExtra(bld._id, sect._id, 'checkSupply')

	return r
}

function supply(idB, clrId, idsS, doc) {
	// Сохраняем в аккумулятор, он потом сохраняется в retain
	store.supply[idB] ??= {}
	store.supply[idB][clrId] = doc
	// console.log('\tПитание:, doc', doc)
	// if (!state) return false
	const noSupplyIds = idsS?.some((id) => isExtralrm(idB, id, 'supply'))
	const noSupply =
		isExtralrm(idB, null, 'supply') ||
		isExtralrm(idB, null, 'battery') ||
		noSupplyIds ||
		isExtralrm(idB, null, 'sb')

	console.log(
		'\t Нет питания nosupply=',
		noSupply,
		'=',
		isExtralrm(idB, null, 'supply'),
		isExtralrm(idB, null, 'battery'),
		noSupplyIds,
		isExtralrm(idB, null, 'sb'),
	)

	// Инициализация времени: Питание отключено
	if (noSupply) {
		// Питание было отключено. Обновляем время
		if (!doc.off) {
			// Обновляем время + записать в retain
			doc.off = new Date()
			doc.on = null
		}
		// Запрет работы по выключенному питанию
		return -1
	}

	// Питание включили
	// Обновляем время включения
	if (!doc.on) doc.on = new Date()
	// Первый запуск, питание в норме - разрешить работу
	if (!doc.off) {
		return 1
	}

	// Питания дали раньше дельты. или вышло время ожидания
	if (!compareTime(new Date(doc.off), timeH) || compareTime(new Date(doc.on), time)) {
		console.log('\t\tПитание дали раньше ')
		// Обнуляю время отключения
		doc.off = null
		return 2
	}
	console.log(
		'\t\tПитание дали в ',
		doc.on,
		' ожидаем проверку ',
		compareTime(new Date(doc.on), time),
	)

	return -2
}

module.exports = checkSupply
