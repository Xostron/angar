const { arrCtrlDO, ctrlDO } = require('@tool/command/module_output')
const { compareTime } = require('@tool/command/time')
const { data: store } = require('@store/index')
const { get } = require('@tool/get/sensor')
const { stasis } = require('../fn')
// 10сек
const _delay = 60_000

/**
 * Тест одновременное вкл всех увлажнителей
 * @param {*} bld Склад
 * @param {*} obj Глобальные данные
 * @param {*} m Собранные исполнительные механизмы
 * @param {*} demo Аккумулятор
 * @param {*} permission Разрешение выполнения теста
 * @param {*} code Код активного теста
 * @returns
 */
function coolerCool(bld, obj, m, checklistPNR, demo, permission, code) {
	// Сейчас в работе другой тест - выкл исполнит. мех-мы
	if (!permission) {
		if (code == 'fan') return
		// Активен - Тест включения всех ВНО
		if (code == 'allFan') return
		arrCtrl(bld._id, m.coolerB)
		return
	}

	// АКТИВЕН - Текущий тест
	// Если нет увлажнителей пропускаем данный тест
	if (!m.coolerB) {
		demo.order++
		demo.timeT = new Date()
		return
	}

	// Включить все испарители
	control(bld, obj, m.coolerB, demo)
}

function control(bld, obj, coolerB, demo) {
	demo.accClr ??= {}
	coolerB.forEach((el) => {
		demo.accClr[el._id] ??= {}
		// // Аккумулятор
		const acc = demo.accClr[el._id]
		// Состояние испарителя
		const v = obj.value?.[el._id]
		// Температура всасывания
		const tmp = get('cooler', el._id, 'cooler', obj?.data?.sensor)?.[0]
		const tmpV = v.sensor?.[tmp?._id]
		// Давление всасывания
		const pin = get('pin', el._id, 'cooler', obj?.data?.sensor)?.[0]
		const pinV = v.sensor?.[pin?._id]
		// Давление нагнетания
		const pout = get('pout', el._id, 'cooler', obj?.data?.sensor)?.[0]
		const poutV = v.sensor?.[pout?._id]
		// Настройки испарителя
		const s = store.calcSetting?.[bld._id]?.coolerCombi

		// Соленоид
		// выкл|вкл
		if (tmpV.state !== 'on' || tmpV.value <= s.defrostOn) {
			arrCtrlDO(bld._id, el.solenoid, 'off')
		} else {
			arrCtrlDO(bld._id, el.solenoid, 'on')
		}
		// ВНО испарителя
		// вкл/выкл
		if (tmpV.state !== 'on' || tmpV.value < s.cold) {
			arrCtrlDO(bld._id, el.fan, 'on')
		} else if (tmpV.value >= s.cold) arrCtrlDO(bld._id, el.fan, 'off')

		// Фиксируем начальную температуру испарителя
		stasis('tmp', tmpV, acc)
		// stasis('pin', pinV, demo, acc)
		// stasis('pout', poutV, demo, acc)
		// Проверка и запись неисправностей в журнал
		check(bld, obj, el, demo, acc, { tmpV, pinV, poutV })
		// console.log(11, el, v)
	})
}

// Проверка вкл/выкл испарителей
function check(bld, obj, el, demo, acc, o) {
	const { tmpV, pinV, poutV } = o
	// Начинаем проверку с задержкой 60сек, чтобы изменения записи выходов вступили в силу
	const t = compareTime(demo.timeT, _delay)
	// Время не прошло
	if (!t) return
	// Время прошло - мониторим состояние разгонника

	const v = obj?.value?.[el._id]
	demo.checklist.coolerCool[el._id] ??= {}
	// датчик температуры всасывания
	// неисправен
	if (tmpV.state != 'on' && !demo.checklist.coolerCool[el._id].tmp1)
		demo.checklist.coolerCool[el._id].tmp1 =
			`датчик температуры всасывания ${tmpV.state == 'alarm' ? 'неисправен' : 'выведен из работы'}`

	if (
		acc.tmp.state == 'on' &&
		tmpV.value >= acc.tmp.value - 0.1 &&
		tmpV.value <= acc.tmp.value + 0.1 &&
		!demo.checklist.coolerCool[el._id].tmp2
	)
		demo.checklist.coolerCool[el._id].tmp2 =
			'не меняется температура испарителя при работе компрессора'

	// датчик давления всасывания
	// неисправен
	if (pinV.state != 'on' && !demo.checklist.coolerCool[el._id].pin1)
		demo.checklist.coolerCool[el._id].pin1 =
			`датчик давления всасывания ${pinV.state == 'alarm' ? 'неисправен' : 'выведен из работы'}`

	if (pinV.state == 'on' && pinV.value < 2 && !demo.checklist.coolerCool[el._id].pin2)
		demo.checklist.coolerCool[el._id].pin2 = 'не меняется давление всасывания'

	// датчик давления нагнетания
	// неисправен
	if (poutV.state != 'on' && !demo.checklist.coolerCool[el._id].pout1)
		demo.checklist.coolerCool[el._id].pout1 =
			`датчик давления нагнетания ${poutV.state == 'alarm' ? 'неисправен' : 'выведен из работы'}`

	if (poutV.state == 'on' && poutV.value < 10 && !demo.checklist.coolerCool[el._id].pout2)
		demo.checklist.coolerCool[el._id].pout2 = 'не меняется давление нагнетания'

	if (poutV.state == 'on' && poutV.value > 21 && !demo.checklist.coolerCool[el._id].pout3)
		demo.checklist.coolerCool[el._id].pout3 = 'давление нагнетания больше 21 bar'

	// Модуль или Конфигурация
	if (
		tmpV.state == 'on' &&
		v?.state != 'on-off-off' &&
		v?.state != 'on-on-off' &&
		!demo.checklist.coolerCool[el._id].stop
	)
		demo.checklist.coolerCool[el._id].stop = 'ошибка модуля или конфигурации'
}

module.exports = coolerCool

function arrCtrl(idB, coolerB) {
	coolerB?.forEach((el) => {
		arrCtrlDO(idB, el.solenoid, 'off')
		arrCtrlDO(idB, el.fan, 'off')
	})
}
