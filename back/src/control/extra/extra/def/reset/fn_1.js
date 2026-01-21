const { ctrlDO } = require('@tool/command/module_output')
const { getSumSig } = require('@tool/command/signal')
const { isReset, reset } = require('@tool/reset')
const { compareTime } = require('@tool/command/time')
const { isErrMs, isErrM } = require('@tool/message/plc_module')
const { delExtralrm } = require('@tool/message/extralrm')
const { getIdsS } = require('@tool/get/building')
const { data: store } = require('@store')

//  * п1. Нажатие на кнопку и первый цикл программы - включает все выходы "Сброса аварии"
function fn_1(bld, m, acc) {
	acc.fn_1 ??= {}
	// Причины вкл выхода
	const reason = [isReset(bld._id), !acc.fn_1.firstFlag]
	// Включить выход "Сброс аварий" и очистить аварийные сообщения
	if (reason.some((el) => el)) {
		// Время активного состояния выхода "Сброс аварии"
		acc.fn_1.wait ??= new Date()
		// Флаг первого цикла отработал
		acc.fn_1.firstFlag = true
		// Включение флага на сброс аварии
		reset(bld._id, true)
	}

	// Включить выход на 3 сек
	const time = acc.fn_1.wait && compareTime(acc.fn_1.wait, 3000)
	if (acc.fn_1.wait && !time) {
		DOReset(m.reset, bld, 'on')
	}

	// По истечению 3 сек -> Выключить выход
	if (time) {
		DOReset(m.reset, bld, 'off')
		delete acc.fn_1.wait
		// Выключить флаг сброса аварии
		reset(null, false, false)
	}
}

// Включение выходов (сброс аварии)
function DOReset(arr, bld, type) {
	arr.forEach((el) => {
		ctrlDO(el, bld._id, type)
	})
}

module.exports = fn_1
