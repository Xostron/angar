const { ctrlDO } = require('@tool/command/module_output')
const { getSignal, getSig } = require('@tool/command/signal')
const { isReset, reset } = require('@tool/reset')
const { compareTime } = require('@tool/command/time')
const { data: store } = require('@store')

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
	// console.log(8801, el, getSignal(ownerId, obj, 'reset'))

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
		// Для секции: включение выхода секции
		if (bld._id !== ownerId) ctrlDO(el, bld._id, 'on')
		// Для склада: включение всех выходов
		else DOReset(m.reset, bld, 'off')
		// Выключить флаг сброса аварии
		reset(null, false, false)
	}

	// По истечению 3 сек -> Выключить выход
	if (time) {
		ctrlDO(el, bld._id, 'off')
		delete acc?.[ownerId]?.wait
	}
}

module.exports = onOffDO

/**
 * Автосброс аварии низкой температуры (аварийное закрытие клапанов)
 * Условия для автосброса
 * 1. Модули исправны
 * 2. Мин темп. канала >= 0.5
 * 3. Авария низкой температуры активна
 *
 * @param {*} bld
 * @param {*} obj
 * @param {*} se
 * @returns true - Разрешить автосброс
 */
function alrClosed(bld, ownerId, obj, se, s, isErrm) {
	// Авария низкой температуры
	const sig = getSignal(ownerId, obj, 'low')
	// Значение температуры канала: по складу/по секции
	let tcnl = bld._id === ownerId ? se.tcnl : obj?.value?.total?.[ownerId]?.tcnl?.min
	// Сигнал на автосброс аварии низкой температуры
	const ac = !isErrm && sig && tcnl >= s.sys.acTcnl && !isNaN(tcnl)

	console.log(
		8800,
		ownerId,
		'Сигнал alrClosed=',
		sig,

		'Автосброс',
		ac,
		'=',
		!isErrm,
		sig,
		tcnl >= s.sys.acTcnl,
		`tcnl: ${tcnl}>=${s.sys.acTcnl}`,
		!isNaN(tcnl)
	)

	return ac
}

/**
 * Для склада: Включение всех выходов (сброс аварии)
 * @param {*} arr Рама
 * @param {*} bld
 * @param {*} type
 */
function DOReset(arr, bld, type) {
	arr.forEach((el) => ctrlDO(el, bld._id, type))
}
