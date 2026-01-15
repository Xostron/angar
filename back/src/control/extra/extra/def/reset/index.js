const { ctrlDO } = require('@tool/command/module_output')
const { getSumSig } = require('@tool/command/signal')
const { isReset, reset } = require('@tool/reset')
const { compareTime } = require('@tool/command/time')
const { isErrMs, isErrM } = require('@tool/message/plc_module')
const { delExtralrm } = require('@tool/message/extralrm')
const { getIdsS } = require('@tool/get/building')
const { data: store } = require('@store')

// Нажата кнопка "Сброс аварии" (mobile, web)
function resetDO(bld, section, obj, s, se, m, alarm, acc, data, ban) {
	// Условия включения DO сброс аварии
	// 1. нажатие на кнопку сброс аварии в мобильном или web
	// 2. Однократное срабатывание при рестарте
	// 3. При аварийном закрытии клапанов: если нет неисправных модулей
	//  И темп канала >=0.5 И есть авария закр клапанов
	const ac = alrClosed(bld, obj, se, s)
	// Все причины
	const reasonAll = [isReset(bld._id), !acc.firstFlag, ac]
	// Обязательные причины, при которых авар сообщения сбрасываются
	const reasonMain = reasonAll.slice(0, 2).includes(true)
	console.log(4400, 'resetDO', reasonAll)

	// Включить выход "Сброс аварий" и очистить аварийные сообщения
	if (reasonAll.some((el) => el)) {
		// Время активного состояния выхода "Сброс аварии"
		acc.wait ??= new Date()
		// Флаг первого цикла отработал
		acc.firstFlag = true
		// Обнулить флаг reset (кнопка сброса аварии)
		// ac && !reasonMain = true аварийные сообщения не сбрасывать
		// если причиной сброса аварии является только авария низкой температуры
		reset(bld._id, ac && !reasonMain)
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
		reset(null, false, false)
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
	const sig = getSumSig(bld._id, obj, 'low')
	// Сигнал на автосброс аварии низкой температуры
	const ac = !isErrm && se.tcnl >= (s.sys.acTcnl ?? 0.5) && sig
	// Сброс сообщений аварии низкой температуры
	// ID всех секций
	const idsS = getIdsS(obj?.data?.section, bld._id)
	idsS.forEach((id, i) => delExtralrm(bld._id, id, 'alrClosed'))
	delExtralrm(bld._id, null, 'alrClosed')
	// console.log(9900, 'Сигнал alrClosed=', sig, 'Автосброс', !isErrm && se.tcnl >= 0.5 && sig, s.sys.acTcnl)
	return ac
}

/**
 * TODO не используется
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
