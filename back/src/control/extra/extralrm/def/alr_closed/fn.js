const { compareTime, remTime } = require('@tool/command/time')
const { msg, msgB } = require('@tool/message')
const { wrExtralrm, delExtralrm } = require('@tool/message/extralrm')
const { data: store } = require('@store')
const { isCombiCold } = require('@tool/combi/is')

/**
 * Пропуск и сброс аварии, если не подходят условия:
 * 1 Секция выключена
 * 2 Склад в режиме комби-холод
 * @param {*} bld
 * @param {*} sect
 * @param {*} s
 * @param {*} automode
 * @param {*} mode
 * @param {*} acc
 * @returns
 */
function check(bld, sect, s, automode, mode, acc) {
	const arr = [
		[mode === null, 'Секция выключена'],
		[isCombiCold(bld, automode, s), 'Склад в режиме холода'],
	]

	const denied = arr.some((el) => el[0])
	if (denied) {
		clear(acc, sect?._id ?? bld?._id)
		delExtralrm(bld._id, sect?._id, 'alrClosed')
	}

	console.log(5501, 'запрет АНТ', !!arr.filter((el) => el[0]).length)

	return denied
}

/**
 * Установка аварии низкой температуры канала в авто/ручном
 * @param {object[]} arr Массив исполнительных механизмов
 * @param {object} value Глобальные состояния
 * @param {object} s Настройки
 * @param {object} accDeb Аккумулятор антидребезга
 */
function set(bld, sect, reason, accDeb, acc, watch) {
	const ownerId = sect?._id ?? bld?._id
	accDeb.alrClosed ??= {}
	accDeb.alrClosed[ownerId] ??= null

	// Уже в аварии || нет причины || секция выкл - выходим из итерации, сброс времени
	if (acc._alarm || !reason) {
		accDeb.alrClosed[ownerId] = null
		console.log(5502, 'нет сигнала')
		return
	}

	// Нет аварии, есть причина -> установка таймера
	if (!accDeb?.alrClosed?.[ownerId]) accDeb.alrClosed[ownerId] = new Date()

	// Ждем по таймеру
	if (!compareTime(accDeb.alrClosed[ownerId], watch))
		return console.log(5503, 'Ждем', remTime(accDeb.alrClosed[ownerId], watch))

	// Время прошло -> устанавливаем аварию низкой температуры канала
	// Авария ручной сброс
	acc._alarm = true
}

function reset(bld, sect, acc, accDeb, mode) {
	const ownerId = sect?._id ?? bld?._id
	accDeb.alrClosed ??= {}
	accDeb.alrClosed[ownerId] ??= null

	// Авария ручной сброс -> флаг готовности сброса по кнопке
	if (acc._alarm) acc.flag = true

	// При сбросе аварии по кнопке (сбрасываются _alarm): очистка аккумулятора
	if (acc.flag && !acc._alarm) clear(acc, sect?._id ?? bld?._id)
}

// Сообщение
function blink(bld, sect, acc) {
	// Если уже в аварии, то выходи
	if (acc?._alarm) {
		const o = sect?._id ? msg(bld, sect, 26, '(Ручной сброс)') : msgB(bld, 26, '(Ручной сброс)')
		wrExtralrm(bld._id, sect?._id, 'alrClosed', o)
		return
	}
	// Не в аварии - создаем-удаляем сообщение
	delExtralrm(bld._id, sect?._id, 'alrClosed')
}

/**
 * Сброс аварии - очистка
 * @param {*} acc
 * @param {*} ownerId
 */
function clear(acc, ownerId) {
	// Флаг для сброса аварии
	delete acc.flag
	// Флаг аварии Ручной сброс
	delete acc._alarm
	// Однократная блокировка ВНО (сброс)
	delete store.heap.lock?.[ownerId]?.low
}

module.exports = { set, reset, blink, check }
