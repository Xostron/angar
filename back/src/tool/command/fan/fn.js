const { ctrlDO, ctrlAO } = require('@tool/command/module_output')
const { isExtralrm } = require('@tool/message/extralrm')
const { isAlr } = require('@tool/message/auto')
const { isErrM } = require('@tool/message/plc_module')
const { setACmd } = require('@tool/command/set')
const { getIdB } = require('@tool/get/building')
const { mech } = require('@tool/command/mech')
const _MAX_SP = 100
const _MIN_SP = 20

/**
 * Команда авторежима на плавный пуск/стоп ВНО секции
 * @param {*} bld Id склада
 * @param {*} resultFan Задание на включение ВНО
 * @param {*} s Настройки склада
 * @param {*} start команда авторежим: пуск/стоп ВНО секции
 */
function fnACmd(bld, resultFan, start, obj, bdata) {
	const idB = bld._id
	const delay = bdata.s.fan.delay * 1000
	const localB = isExtralrm(idB, null, 'local')
	const coolerCombiOn = isCoolerCombiOn(bld, bdata)

	resultFan.list.forEach((idS) => {
		const sectOn = obj?.retain?.[idB]?.mode?.[idS]
		const local = isExtralrm(idB, idS, 'local')
		const goVNO = isСoolerCombiVNO(bld, idS, obj, bdata)
		if (local || localB || !sectOn || !coolerCombiOn || !goVNO) {
			console.log(
				'Секция',
				idS,
				'Плавный пуск: ВНО выключены из-за:',
				local,
				localB,
				!sectOn,
				!coolerCombiOn,
				!goVNO
			)
			setACmd('fan', idS, { delay, type: 'off' })
		} else
			!resultFan?.force
				? setACmd('fan', idS, { delay, type: start ? 'on' : 'off' })
				: setACmd('fan', idS, { delay, type: 'on' })
	})
}

/**
 * Комби склад в режиме холодильника, при хранении
 * и настройке "Испаритель холодильного оборудования"=false
 * => испарители и ВНО должны выключиться
 * @param {*} bld Рама склада
 * @param {*} bdata Собранные данные
 * @param {*} s Настройки
 * @returns {boolean} false - испаритель выключен
 */
function isCoolerCombiOn(bld, bdata) {
	const { automode, s } = bdata
	let coolerCombiOn = true
	const alrAuto = isAlr(bld._id, automode)
	if (bld?.type === 'combi' && automode === 'cooling' && alrAuto)
		coolerCombiOn = s?.coolerCombi?.on ?? true

	console.log(
		'Настройка "Испаритель холодильного оборудования" =',
		s?.coolerCombi?.on,
		coolerCombiOn
	)
	if (coolerCombiOn === false)
		console.log(
			'Комби склад. Испарители и ВНО выключены. Настройка "Испаритель холодильного оборудования" ВЫКЛ'
		)
	return coolerCombiOn
}

/**
 * Для комби склада в режиме холодильника
 * Запрет работы ВНО, если в секции выключены ВНО испарителей
 * @param {*} bld Рама склада
 * @param {*} idS ИД секции
 * @param {*} obj Глобальные данные
 * @param {*} bdata Данные склада
 * @returns
 */
function isСoolerCombiVNO(bld, idS, obj, bdata) {
	const alrAuto = isAlr(bld._id, bdata.automode)
	let state = true
	if (bld?.type === 'combi' && bdata?.automode === 'cooling' && alrAuto) {
		const mS = mech(obj, idS, bld._id)
		// Агрегированное состояние по испарителям секций
		state = mS.coolerS.some((clr) => {
			const stateClr = obj?.value?.[clr._id]?.state
			return stateClr === 'off-on-off' || stateClr === 'on-on-off'
		})
		// Если имеется хотя бы один испаритель у которого включен ВНО, то разрешаем работу ВНО
		console.log('state', state)
		return state
	}
	return state
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
	// Выведен из работы для секционных ВНО и ВНО испарителей
	result[fan._id].off = fanOff(idB, fan, equip.cooler, retain)

	const alr = isAlrmByFan(idB, fan, equip, retain)
	const alrDeb = isExtralrm(idB, 'debounce', fan._id)
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
