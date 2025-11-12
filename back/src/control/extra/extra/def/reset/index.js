const { ctrlDO } = require('@tool/command/module_output')
const { getSignal } = require('@tool/command/signal')
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
	if (isReset(bld._id) || !acc.firstFlag || alrClosed(bld, obj, se)) {
		acc.wait = new Date()
		acc.firstFlag = true
		// Обнулить флаг reset (кнопка сброса аварии)
		reset(null, false)
	}
	// Сброс аварии при потери связи
	connect(obj, bld, m, acc)

	// Включить выход на 3 сек
	const time = acc.wait && compareTime(acc.wait, 3000)
	if (acc.wait && !time) {
		DOReset(m.reset, bld, 'on')
	}
	// По истечению 3 сек -> Выключить выход
	if (time) {
		DOReset(m.reset, bld, 'off')
		delete acc.wait
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
 * Включение выходов на модулях, которые принадлежат разным секции
 * При отключении данного выхода срабатывает реле безопасности,
 * которое все отключает
 * Реле безопасности у каждой секции
 */
// Если сигнал "Модуль в сети" пропадал, то включаем выход сброса аварии
function connect(obj, bld, m, acc) {
	if (!m?.connect?.length) return
	acc.reset ??= {}
	m.connect.forEach((el) => {
		const sig = obj.value?.[el._id]
		const idM = el.module?.id
		const isErr = isErrM(bld._id, idM)
		if (isErr || !sig) acc.reset[idM] = true
		if (sig && acc.reset?.[idM]) {
			acc.wait = new Date()
			acc.firstFlag = true
			delete acc.reset?.[idM]
		}
	})
}

function alrClosed(bld, obj, se) {
	// Неисправность модулей
	const isErrm = isErrMs(bld._id)
	// Аварийное закрытие клапанов (сигнал Склада)
	const acBld = getSignal(bld?._id, obj, 'low')
	// Аварийное закрытие клапанов (сигналы секций)
	const acSec = obj.data.section
		.filter((el) => el.buildingId === bld._id)
		.reduce((acc, el) => {
			acc.push(getSignal(el._id, obj, 'low'))
			return acc
		}, [])
		.some((el) => !!el)

	const alr = acSec || acBld
	return !isErrm && se.tcnl >= 0.5 && alr
}
