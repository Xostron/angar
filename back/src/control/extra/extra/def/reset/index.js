const { ctrlDO } = require('@tool/command/module_output')
const { getSignal, getSumSig } = require('@tool/command/signal')
const { data: store } = require('@store')
const { isReset, reset } = require('@tool/reset')
const { compareTime } = require('@tool/command/time')
const { isErrMs, isErrM } = require('@tool/message/plc_module')

// Нажата кнопка "Сброс аварии" (mobile, web)
function resetDO(bld, section, obj, s, se, m, alarm, acc, data, ban) {
	// Условия включения DO сброс аварии
	// 1. нажатие на кнопку сброс аварии в мобильном или web
	// 2. Однократное срабатывание при рестарте
	// 3. При аварийном закрытии клапанов: если нет неисправных модулей
	//  И темп канала >=0.5 И есть авария закр клапанов
	// 4. При потере сигнала модуль в сети
	const reason = [
		isReset(bld._id),
		!acc.firstFlag,
		alrClosed(bld, obj, se, s),
		// connect(obj, bld, m),
	]
	console.log(4400, 'resetDO', reason)
	if (reason.some((el) => el)) {
		acc.wait ??= new Date()
		acc.firstFlag = true
		// Обнулить флаг reset (кнопка сброса аварии)
		reset(bld._id)
	}

	// Включить выход на 3 сек
	const time = acc.wait && compareTime(acc.wait, 3000)
	if (acc.wait && !time) {
		DOReset(m.reset, bld, 'on')
	}
	// По истечению 3 сек -> Выключить выход
	if (time) {
		DOReset(m.reset, bld, 'off')
		delete acc.wait
		reset(null, false)
	}
}
module.exports = resetDO

// Включение выходов (сброс аварии)
function DOReset(arr, bld, type) {
	arr.forEach((el) => {
		ctrlDO(el, bld._id, type)
	})
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
 * @returns
 */
function alrClosed(bld, obj, se, s) {
	// Неисправность модулей
	const isErrm = isErrMs(bld._id, obj?.data?.module)
	// Авария низкой температуры (сигнал Склада и секций)
	const sig = getSumSig(bld._id, obj?.data?.section, obj, 'low')
	// console.log(9900, 'alrClosed', sig, 'Автосброс', !isErrm && se.tcnl >= 0.5 && sig, s.sys.acTcnl)
	return !isErrm && se.tcnl >= (s.sys.acTcnl ?? 0.5) && sig
}

/**
 * Имеется DO сигнал "Модуль в сети", если модуль данного сигнала
 * неисправен или сам сигнал был выключен, то вырабатывается
 * импульс на включение выхода "Сброс аварии"
 * @param {*} obj
 * @param {*} bld
 * @param {*} m
 * @param {*} acc
 * @returns
 */
function connect(obj, bld, m) {
	if (!m?.connect?.length) return
	let reset = false
	// Перебор сигналов "Модуль в сети"
	m.connect.forEach((el) => {
		const sig = obj.value?.[el._id]
		const idM = el.module?.id
		const isErr = isErrM(bld._id, idM)
		// Неисправен модуль данного сигнала || сигнал выключен
		if (isErr || !sig) reset = true
	})
	return reset
}
