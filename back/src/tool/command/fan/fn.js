const { ctrlDO } = require('@tool/command/module_output')
const { isExtralrm } = require('@tool/message/extralrm')
const { setACmd } = require('@tool/command/set')
const { getIdB } = require('@tool/get/building')

/**
 * Команда авторежима на пуск/стоп ВНО секции
 * @param {*} bldId Id склада
 * @param {*} resultFan Задание на включение ВНО
 * @param {*} s Настройки склада
 * @param {*} start команда авторежим: пуск/стоп ВНО секции
 */
function fnACmd(bldId, resultFan, s, start) {
	const delay = s.fan.delay * 1000
	resultFan.list.forEach((idS) => {
		if (!isExtralrm(bldId, idS, 'local') && !isExtralrm(bldId, null, 'local')) {
			!resultFan?.force
				? setACmd('fan', idS, { delay, type: start ? 'on' : 'off' })
				: setACmd('fan', idS, { delay, type: 'on' })
		} else setACmd('fan', idS, { delay, type: 'off' })
	})
}

/**
 * Прогрев клапанов
 * @param {*} resultFan Задание на включение ВНО
 * @param {*} s Настройки склада
 */
// Задержка включения ВНО при прогреве клапанов
const delay = 3
function fnFanWarm(resultFan, s) {
	const group = Object.values(resultFan.warming)
	for (const o of group) {
		setACmd('fan', o.sectionId, { delay, type: 'on', warming: true })
	}
}

/**
 * Состояние устройств (вентиляторы, обогреватель и т.д.)
 * @param {*} id Id исполнительного механизма
 * @param {*} value Прочитанные данные с модуля
 */
function stateEq(id, value) {
	return value?.outputEq?.[id]
}

// Состояние вентилятора
function stateF(fan, equip, result, retain) {
	const idB = getIdB(fan.module?.id, equip.module)
	// Выведен из работы для секционных ВНО и ВНО испарителей
	let off
	if (fan.owner.type == 'section') off = retain?.[idB]?.fan?.[fan.owner.id]?.[fan._id]
	else if (fan.owner.type == 'cooler') {
		const secId = equip.cooler.find((el) => el._id == fan.owner.id)?.sectionId
		off = retain?.[idB]?.fan?.[secId]?.[fan._id]
	}
	// Состояние выхода
	const out = result?.outputEq?.[fan._id]
	if (off) return 'off'
	if (result?.[fan._id]?.qf || result?.[fan._id]?.heat) return 'alarm'
	if (out) return 'run'
	return 'stop'
}

function arrCtrl(idB, arr, type) {
	arr?.forEach((el) => ctrlDO(el, idB, type))
}
module.exports = { fnACmd, fnFanWarm, stateEq, stateF, arrCtrl }
