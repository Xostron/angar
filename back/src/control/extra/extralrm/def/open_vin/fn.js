const { msgB } = require('@tool/message')
const { curStateV } = require('@tool/command/valve')
const { compareTime } = require('@tool/command/time')
const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')

// Установка аварии
function set(bld, obj, seB, s, m, acc) {
	// Есть ли хоть один открытый приточный клапан
	const hasOpen = m.vlvIn.some((el) => curStateV(el._id, obj.value) === 'opn')
	// Клапан открыт и темп.канала > темп. продукта
	const attn = hasOpen && seB.tcnl > seB.tprd
	// Если еще нет аварии, а условия для аварии прошли за время s.cooling.watch
	// То сброс аккумулятора
	if (!attn && !acc._alarm) fnReset(bld, acc)

	// Условия аварии возникли засекаем время s.cooling.watch
	if (attn && !acc?.watch) acc.watch = new Date()
	// Время ожидания 5 мин закончилось
	const watch = compareTime(acc?.watch, s.cooling.watch)
	// Вкл аварии и засекаем время для сброса аварии 1 час
	if (watch && !acc._alarm) {
		wrExtralrm(bld._id, null, 'openVin', msgB(bld, 39))
		acc.wait = new Date()
		acc._alarm = true
	}
}
// Автосброс аварии
function reset(bld, s, acc) {
	// Время автосброса аварии закончилось
	const wait = compareTime(acc?.wait, s.cooling.wait)
	// Время закончилось
	if (wait) fnReset(bld, acc)
}

/**
 * Разрешение на работу
 * @param {*} bld
 * @param {*} obj
 * @param {*} s
 * @param {*} automode
 * @param {*} m
 * @param {*} acc
 * @returns {boolean} true разрешить, false - очистить аккумулятор и запретить
 */
function fnCheck(bld, obj, s, automode, m, acc) {
	// Очищаем аккумулятор и игнорируем слежение:
	// 1. Склад не в авторежиме хранения
	// 2. Нет приточных клапанов
	// 3. Нет секции в авто
	// 4. Нет настроек watch|wait
	
	// Поиск по секциям, хотя бы 1 в авто => true
	const modeS = obj?.data?.section
		?.filter((el) => el.buildingId === bld._id)
		?.some((el) => obj?.retain?.[bld._id]?.mode?.[el._id])
	if (
		automode !== 'cooling' ||
		!m?.vlvIn?.length ||
		!modeS ||
		!s.cooling.wait ||
		!s.cooling.watch
	) {
		fnReset(bld, acc)
		return false
	}
	return true
}

/**
 * @description Очистка аварийного сообщения и аккумулятора
 * @param {*} bld склад
 * @param {*} acc аккумулятор данной аварии
 */
function fnReset(bld, acc) {
	delExtralrm(bld._id, null, 'openVin')
	delete acc.watch
	delete acc.wait
	delete acc._alarm
}

module.exports = { set, reset, fnReset, fnCheck }
