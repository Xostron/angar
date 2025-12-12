const { msgBB } = require('@tool/message')
const { wrExtralrm, delExtralrm } = require('@tool/message/extralrm')

/**
 * Функция слежения и генерации аварии дребезга
 * @param {object[]} arr Массив исполнительных механизмов
 * @param {object} value Глобальные состояния
 * @param {object} s Настройки
 * @param {object} accDeb Аккумулятор антидребезга
 */
function set(bld, battery, obj, accDeb, acc, watch, count) {
	// Уже в аварии - выходим из итерации
	if (acc._alarm) return

	accDeb.battery ??= []
	const last = accDeb.battery.at(-1)

	// Фиксируем изменение состояния
	if (last?.state !== battery) accDeb.battery.push({ state: battery, date: new Date() })
	// Размер очереди превышен
	if (accDeb.battery.length > count) accDeb.battery.shift()

	// Проверка на дребезг, после count переключений
	if (accDeb.battery.length < count) return

	const delta = accDeb.battery.at(-1).date - accDeb.battery[0].date
	// Время между последними состояниями больше порога дребезга -> ОК
	if (delta > watch) return
	//Время меньше порога -> установка аварии
	wrExtralrm(bld._id, null, 'battery', msgBB(bld, 103))
	acc._alarm = true
}

function reset(acc, accDeb) {
	if (acc._alarm) acc.flag = true
	// При сбросе аварии: очистка аккумулятора
	if (acc.flag && !acc._alarm) {
		accDeb.battery = []
		delete acc.flag
		delete acc._alarm
	}
}

// Для логов, ловим импульсы просадки напряжения
function blink(bld, battery, acc) {
	if (acc._alarm) return
	if (battery) wrExtralrm(bld._id, null, 'battery', msgBB(bld, 103))
	else delExtralrm(bld._id, null, 'battery')
}

module.exports = { set, reset, blink }
