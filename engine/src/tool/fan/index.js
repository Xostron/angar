const { isExtralrm } = require('@tool/message/extralrm')
const { isErrM } = require('@tool/message/plc_module')
const { getIdB, getSectAuto } = require('@tool/get/building')
const { getVno, getVnoClr } = require('@tool/command/mech/get')
const { getClr } = require('@tool/command/mech/fn')

// Состояние вентилятора (секции, разгонного, испарителя)
function stateF(fan, equip, result, retain) {
	const idB = getIdB(fan.module?.id, equip.module)
	// Выведен из работы для секционных ВНО и ВНО испарителей
	result[fan._id].off = fanOff(idB, fan, equip.cooler, retain)

	const alr = isAlrmByFan(idB, fan, equip, retain)
	const alrDeb = isExtralrm(idB, 'debdo', fan._id)

	// Авария ВНО: По автоматическому выключателю,
	// перегрев (у ВНО испарителей), неисправные модули к которым подключен ВНО
	if (result?.[fan._id]?.qf || result?.[fan._id]?.heat || alr || alrDeb) return 'alarm'
	// Выведен из работы
	if (result[fan._id].off) return 'off'
	// В работе
	const out = result?.outputEq?.[fan._id]
	if (out) return 'run'

	return 'stop'
}

// Выведен из работы для секционных ВНО и ВНО испарителей
function fanOff(idB, fan, cooler, retain) {
	let off
	if (fan.owner.type == 'section') off = retain?.[idB]?.fan?.[fan.owner.id]?.[fan._id]
	else if (fan.owner.type == 'cooler') {
		const secId = cooler.find((el) => el._id == fan.owner.id)?.sectionId
		off = retain?.[idB]?.fan?.[secId]?.[fan._id]
	}
	return off
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
	// const start = retain?.[idB]?.start
	// Режим секции: авто true, ручной false, выкл null
	// const mode = fnMode(idB, fan, cooler, retain)
	// console.log(start, mode, start && mode !== false)
	// Коллекция модулей ПЛК
	const arrM = new Set()
	// 1. Найти модули обратной связи ВНО (учитываем неисправность данных модулей только когда склад включен и секция не в ручном режиме)
	// if ((start && mode !== false) || fan?.type === 'accel')
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
		// console.log(1, `ВНО${fan.order} ${fan._id}, Модуль ${idM} ${mdl.ip}, авария=${t}`)
		return t
	})
}

/**
 * Состояние устройств (вентиляторы, обогреватель и т.д.)
 * @param {*} id Id исполнительного механизма
 * @param {*} value Прочитанные данные с модуля
 */
function stateEq(id, value) {
	return value?.outputEq?.[id]
}

/**
 * Поиск работающих ВНО, в секциях-авто
 * @param {*} idB
 * @param {*} obj
 * @param {*} idS
 * @returns
 * Если указан idS, то возвратить работающие ВНО для секции
 * Если не указано, то по всем секциям выдать работающие ВНО
 */
function stateSum(idB, obj, idS) {
	const { data, retain, value } = obj
	let idsS
	// Если указан idS, то возвратить работающие ВНО для секции
	if (idS) {
		const mode = obj.retain?.[idB]?.mode?.[idS]
		if ([false, null].includes(mode)) return { idsS: [], arr: [] }
		idsS = [idS]
	}
	// Если не указано, то по всем секциям в авто выдать работающие ВНО
	else idsS = getSectAuto(idB, obj)

	// Получить ВНО секций в авто
	const arr = idsS
		.flatMap((idS) => [
			...getVno(idB, idS, { retain, value }, data.binding, data.fan),
			...getVnoClr(idB, idS, { retain, value }, getClr(data, idS)).fanClr,
		])
		.filter((el) => value[el._id].state == 'run')

	return { idsS, arr }
}

module.exports = { stateF, stateEq, stateSum }
