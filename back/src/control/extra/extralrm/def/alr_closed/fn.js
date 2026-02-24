const { compareTime } = require('@tool/command/time')
const { msg, msgB } = require('@tool/message')
const { wrExtralrm, delExtralrm } = require('@tool/message/extralrm')
const { data: store } = require('@store')

/**
 * Установка аварии низкой температуры канала в авто/ручном
 * @param {object[]} arr Массив исполнительных механизмов
 * @param {object} value Глобальные состояния
 * @param {object} s Настройки
 * @param {object} accDeb Аккумулятор антидребезга
 */
function set(bld, sect, reason, accDeb, acc, watch, mode) {
	const ownerId = sect?._id ?? bld?._id
	accDeb.alrClosed ??= {}
	accDeb.alrClosed[ownerId] ??= null
	// Уже в аварии || нет причины || секция выкл - выходим из итерации, сброс времени
	if (acc._alarm || !reason || mode===null) {
		accDeb.alrClosed[ownerId] = null
		return
	}
	// Нет аварии, есть причина -> установка таймера
	if (!accDeb?.alrClosed?.[ownerId]) accDeb.alrClosed[ownerId] = new Date()
	// Ждем по таймеру
	if (!compareTime(accDeb.alrClosed[ownerId], watch)) {
		return
	}
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
	if ((acc.flag && !acc._alarm) || mode === null) {
		// Флаг для сброса аварии
		delete acc.flag
		// Флаг аварии Ручной сброс
		delete acc._alarm
		// Однократная блокировка ВНО (сброс)
		delete store.heap.lock?.[ownerId]?.low
	}
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

const mm = {
	false: 'Ручной',
	true: 'Авто',
	undefined: 'Авто',
	null: 'Выключена',
}

module.exports = { set, reset, blink, mm }
