const { msg, msgB } = require('@tool/message')
const { wrExtralrm, delExtralrm } = require('@tool/message/extralrm')

/**
 * Функция слежения и генерации аварии дребезга
 * @param {object[]} arr Массив исполнительных механизмов
 * @param {object} value Глобальные состояния
 * @param {object} s Настройки
 * @param {object} accDeb Аккумулятор антидребезга
 */
function set(bld, sect, reason, accDeb, acc, watch, count) {
	const ownerId = sect?._id ?? bld?._id
	// Уже в аварии - выходим из итерации
	if (acc._alarm) return

	accDeb.alrClosed ??= {}
	accDeb.alrClosed[ownerId] ??= []
	const last = accDeb.alrClosed[ownerId].at(-1)

	// Фиксируем изменение состояния
	if (last?.state !== reason) accDeb.alrClosed[ownerId].push({ state: reason, date: new Date() })
	// Размер очереди превышен
	if (accDeb.alrClosed[ownerId].length > count) accDeb.alrClosed[ownerId].shift()

	// Проверка на дребезг, после count переключений
	if (accDeb.alrClosed[ownerId].length < count) return

	const delta = accDeb.alrClosed[ownerId].at(-1).date - accDeb.alrClosed[ownerId][0].date
	// Время между последними состояниями больше порога дребезга -> ОК
	if (delta > watch) return
	//Время меньше порога -> установка аварии (ручной сброс)
	// Авария ручной сброс
	acc._alarm = true
}

function reset(bld, sect, acc, accDeb) {
	const ownerId = sect?._id ?? bld?._id
	accDeb.alrClosed ??= {}
	accDeb.alrClosed[ownerId] ??= []
	// Авария ручной сброс -> флаг готовности сброса по кнопке
	if (acc._alarm) acc.flag = true
	// При сбросе аварии по кнопке (сбрасываются _alarm): очистка аккумулятора
	if (acc.flag && !acc._alarm) {
		accDeb.alrClosed[ownerId] = []
		// Флаг для сброса аварии
		delete acc.flag
		// Флаг аварии Ручной сброс
		delete acc._alarm
		// Флаг аварии Импульсы
		delete acc._self
	}
}

// Для логов, ловим импульсы аварии
function blink(bld, sect, sig, acc, mode) {
	// Если уже в аварии, то выходи
	if (acc._alarm) {
		const o = sect?._id ? msg(bld, sect, 26, '(Ручной сброс)') : msgB(bld, 26, '(Ручной сброс)')
		wrExtralrm(bld._id, sect?._id, 'alrClosed', o, mode)
		return
	}
	// Не в аварии - создаем-удаляем сообщение
	if (sig) {
		const o = sect?._id ? msg(bld, sect, 26) : msgB(bld, 26)
		wrExtralrm(bld._id, sect?._id, 'alrClosed', o, mode)
		acc._self = true
	} else {
		delExtralrm(bld._id, sect?._id, 'alrClosed')
		acc._self = false
	}
}

module.exports = { set, reset, blink }
