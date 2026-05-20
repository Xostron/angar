const { ctrlDO } = require('@tool/command/module_output')
const { getSignal, getSig } = require('@tool/command/signal')
const { isReset, reset } = require('@tool/reset')
const { compareTime } = require('@tool/command/time')
const { data: store } = require('@store')
const { readAcc } = require('@store/index')

/**
 * п2. Автосброс аварии закрытия клапанов (включение конкретного выхода "Сброса аварии,
 * например: имеется авар. закр. клапанов на секции 2, при срабатывании автосброса, включится
 * выход "Сброса аварии" секции 2, остальные будут не аактивны
 */
function onOffDO(bld, ownerId, obj, s, se, m, isErrm, acc) {
	acc[ownerId] ??= {}

	// Причины для секции: Рарешить автосброс
	const reason = [alrClosed(bld, ownerId, obj, se, s, isErrm)]
	// Причины для склада
	if (bld._id === ownerId) reason.push(...[isReset(bld._id), !acc.firstFlag])

	// Для секции: Рама сигнала сброса аварии конкрентной секции
	const el = getSig(ownerId, obj, 'reset')
	// Для склада: берутся все выходы и по складу и по секции

	// Вкл/выкл выхода
	if (reason.some((el) => el)) {
		// Время активного состояния выхода "Сброс аварии"
		acc[ownerId].wait ??= new Date()
		// Флаг первого цикла отработал
		acc.firstFlag = true
	}
	// Включить выход на 3 сек
	const time = acc?.[ownerId]?.wait && compareTime(acc?.[ownerId]?.wait, 3000)
	if (acc?.[ownerId]?.wait && !time) {
		DOReset(el, m.reset, bld, ownerId, 'on')
		// Выключить флаг сброса аварии
		reset(null, false, false)
	}

	// По истечению 3 сек -> Выключить выход
	if (time) {
		DOReset(el, m.reset, bld, ownerId, 'off')
		delete acc?.[ownerId]?.wait
		reset(null, false, false)
	}
}

module.exports = onOffDO

/**
 * Автосброс аварии низкой температуры 
 * Условия для автосброса
 * 1. Модули исправны
 * 2. Мин темп. канала >= 0.5
 * 3. Низкая температура канала активна
 *
 * @param {*} bld
 * @param {*} obj
 * @param {*} se
 * @returns true - Разрешить автосброс
 */
function alrClosed(bld, ownerId, obj, se, s, isErrm) {
	// Низкая температура канала
	const sig = getSignal(ownerId, obj, 'low')
	// Значение температуры канала: по складу/по секции
	let tcnl = bld._id === ownerId ? se.tcnl : obj?.value?.total?.[ownerId]?.tcnl?.min
	// Низкая температура канала стала только через Ручной сброс
	const accAC = readAcc(
		bld._id,
		bld._id === ownerId ? 'building' : ownerId,
		bld._id === ownerId ? 'alrClosedB' : 'alrClosed'
	)
	// Сигнал на автосброс аварии низкой температуры
	const ac = !isErrm && sig && tcnl >= s.sys.acTcnl && !isNaN(tcnl) && !accAC?._alarm

	// console.log(
	// 	8800,
	// 	ownerId,
	// 	'Сигнал alrClosed=',
	// 	sig,

	// 	'Автосброс = ',
	// 	!isErrm,
	// 	sig,
	// 	`tcnl: ${tcnl}>=${s.sys.acTcnl} = ${tcnl >= s.sys.acTcnl}`,
	// 	!isNaN(tcnl),
	// 	!accAC?._alarm,
	// 	'=',
	// 	ac,
	// 	'Аккумулятор alrClosed =',
	// 	accAC
	// )

	return ac
}

/**
 * Для склада: Включение всех выходов (сброс аварии)
 * @param {*} arr Рама
 * @param {*} bld
 * @param {*} type
 */
function DOReset(el, arr, bld, ownerId, type) {
	// Для секции: включение выхода секции
	if (bld._id !== ownerId) ctrlDO(el, bld._id, 'on')
	// Для склада: включение всех выходов
	else arr.forEach((el) => ctrlDO(el, bld._id, type))
}
