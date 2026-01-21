const { ctrlDO } = require('@tool/command/module_output')
const { getSumSig, getSignal, getSig } = require('@tool/command/signal')
const { isReset, reset } = require('@tool/reset')
const { compareTime } = require('@tool/command/time')
const { isErrMs, isErrM } = require('@tool/message/plc_module')
const { delExtralrm } = require('@tool/message/extralrm')
const { getIdsS, getIdBS } = require('@tool/get/building')
const { data: store } = require('@store')

/**
 * п2. Автосброс аварии закрытия клапанов (включение конкретного выхода "Сброса аварии,
 * например: имеется авар. закр. клапанов на секции 2, при срабатывании автосброса, включится
 * выход "Сброса аварии" секции 2, остальные будут не аактивны
 */
function fn_2(bld, obj, s, se, m, acc) {
	const idBS = getIdBS(obj?.data?.section, bld._id)
	// Неисправность модулей
	const isErrm = isErrMs(bld._id, obj?.data?.module)

	idBS.forEach((ownerId) => onOffDO(bld, ownerId, obj, se, s, isErrm, acc))
}

module.exports = fn_2

function onOffDO(bld, ownerId, obj, se, s, isErrm, acc) {
	acc.fn_2 ??= {}
	acc.fn_2[ownerId] ??= {}
	// Рарешить автосброс
	const r = alrClosed(bld, ownerId, obj, se, s, isErrm)
	// DO сброса аварии
	const el = getSig(ownerId, obj, 'reset')
	console.log(8801, el, getSignal(ownerId, obj, 'reset'))
	// Вкл/выкл выхода
	if (r) {
		// Время активного состояния выхода "Сброс аварии"
		acc.fn_2[ownerId].wait ??= new Date()
		// Включение флага на сброс аварии
		reset(bld._id, true)
	}
	// Включить выход на 3 сек
	const time = acc?.fn_2?.[ownerId]?.wait && compareTime(acc.fn_2[ownerId].wait, 3000)
	if (acc?.fn_2?.[ownerId]?.wait && !time) {
		console.log(8802, 'on')
		ctrlDO(el, bld._id, 'on')
	}

	// По истечению 3 сек -> Выключить выход
	if (time) {
		console.log(8803, 'off')
		ctrlDO(el, bld._id, 'off')
		delete acc?.fn_2?.[ownerId]?.wait
		// Выключить флаг сброса аварии
		reset(null, false, false)
	}
}

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
