const { ctrlDO, ctrlAO } = require('@tool/command/module_output')
const { isExtralrm } = require('@tool/message/extralrm')
const { isErrM } = require('@tool/message/plc_module')
const { setACmd } = require('@tool/command/set')
const { getIdB } = require('@tool/get/building')
const _MAX_SP = 100
const _MIN_SP = 20

/**
 * Команда авторежима на пуск/стоп ВНО секции
 * @param {*} idB Id склада
 * @param {*} resultFan Задание на включение ВНО
 * @param {*} s Настройки склада
 * @param {*} start команда авторежим: пуск/стоп ВНО секции
 */
function fnACmd(idB, resultFan, s, start, obj) {
	const delay = s.fan.delay * 1000
	resultFan.list.forEach((idS) => {
		const sectOn = obj?.retain?.[idB]?.mode?.[idS]
		const local = isExtralrm(idB, idS, 'local')
		const localB = isExtralrm(idB, null, 'local')
		if (local || localB || !sectOn) setACmd('fan', idS, { delay, type: 'off' })
		else
			!resultFan?.force
				? setACmd('fan', idS, { delay, type: start ? 'on' : 'off' })
				: setACmd('fan', idS, { delay, type: 'on' })
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

// Состояние вентилятора (секции, разгонного, испарителя)
function stateF(fan, equip, result, retain) {
	const idB = getIdB(fan.module?.id, equip.module)
	// Авария ВНО: По автоматическому выключателю, перегрев (у ВНО испарителей), неисправные модули к которым подключен ВНО
	const alr = isAlrmByFan(idB, fan, equip, retain)
	if (result?.[fan._id]?.qf || result?.[fan._id]?.heat || alr) return 'alarm'
	// Выведен из работы для секционных ВНО и ВНО испарителей
	let off
	if (fan.owner.type == 'section') off = retain?.[idB]?.fan?.[fan.owner.id]?.[fan._id]
	else if (fan.owner.type == 'cooler') {
		const secId = equip.cooler.find((el) => el._id == fan.owner.id)?.sectionId
		off = retain?.[idB]?.fan?.[secId]?.[fan._id]
	}
	if (off) return 'off'
	// В работе
	const out = result?.outputEq?.[fan._id]
	if (out) return 'run'

	return 'stop'
}
/**
 * Модули ПЛК ВНО неисправны?
 * Поиск модулей к которым привязан ВНО
 * Проверка найденных модулей на неисправность
 * Если какой-либо модуль неисправен -> ВНО в аварии
 * Примечание:
 * 1. Разгонные ВНО, наблюдаем за всеми модулями
 * 2. Секционные ВНО и ВНО испарителей: когда склад ВКЛ и секция НЕ В РУЧ РЕЖИМЕ
 * наблюдаем за всеми модулями, иначе учитываем только модули ВЫХОДОВ
 *
 * @param {string} idB ИД склада
 * @param {object} fan Рама ВНО
 * @param {object} equip Рама оборудования
 * @param {object} retain Сохраненные данные
 * @returns true Неисправны / false Модули ОК
 */
function isAlrmByFan(idB, fan, equip, retain) {
	const { signal, module, binding, cooler } = equip
	// Включен ли склад
	const start = retain?.[idB]?.start
	// Режим секции: авто true, ручной false, выкл null
	const mode = fnMode(idB, fan, cooler, retain)
	console.log(start, mode, start && mode !== false)
	// Коллекция модулей ПЛК
	const arrM = new Set()
	// 1. Найти модули обратной связи ВНО (учитываем неисправность данных модулей только когда склад включен и секция не в ручном режиме)
	if ((start && mode !== false) || fan?.type === 'accel')
		signal
			.filter((el) => el?.owner?.id === fan._id)
			.forEach((el) => {
				arrM.add(el?.module?.id)
			})
	// 2. Найти модули дискретных выходов
	arrM.add(fan?.module?.id)
	// 3. Найти аналоговый модуль выходов (для ВНО + ПЧ)
	const aoId = binding.find((el) => el.owner.id === fan._id)?.moduleId
	aoId ? arrM.add(aoId) : null
	// 4. Проверка модулей

	return [...arrM].some((idM) => {
		const t = isErrM(idB, idM)
		const mdl = module.find((el) => el._id === idM)
		console.log(`ВНО${fan.order} ${fan._id}, Модуль ${idM} ${mdl.ip}, авария=${t}`)
		return t
	})
}

function arrCtrl(idB, arr, type) {
	arr?.forEach((el) => {
		ctrlDO(el, idB, type)
		if (el.ao) ctrlAO(el, idB, type === 'off' ? _MIN_SP : _MAX_SP)
	})
}

module.exports = { fnACmd, fnFanWarm, stateEq, stateF, arrCtrl }

/**
 * Режим секции данного ВНО
 * @param {*} fan Рама ВНО
 * @return {boolean | null} авто true, ручной false, выкл null
 */
function fnMode(idB, fan, cooler, retain) {
	switch (fan?.owner?.type) {
		case 'building':
			// Для разгонных ВНО все равно какой режим у секции, он принадлежит складу
			return true
		case 'section':
			return retain?.[idB]?.mode?.[fan?.owner?.id]
		case 'cooler':
			const idS = cooler.find((el) => el._id === fan.owner.id)?.sectionId
			return retain?.[idB]?.mode?.[idS]
		default:
			true
	}
}
