const { stateF } = require('@tool/command/fan/fn')
const { data: store, readAcc } = require('@store')
const { getIdByClr, getB } = require('@tool/get/building')
const { isErrM } = require('@tool/message/plc_module')

// Испаритель
function cooler(equip, val, retain, result) {
	const { building, cooler, sensor, fan, heating, binding, section, signal, aggregate } = equip
	// Собираем по испарителю состояния его основных узлов
	cooler.forEach((clr) => {
		// Массив модулей ПЛК испарителя
		const arrM = new Set()
		// Состояния периферии испарителя
		result[clr._id] ??= {}
		result[clr._id].solenoid ??= {}
		result[clr._id].fan ??= {}
		result[clr._id].heating ??= {}
		result[clr._id].sensor ??= {}
		result[clr._id].solHeat ??= {}
		result[clr._id].aggregate ??= {}

		// Агрегат (по нему модули не фиксируем, т.к. они проверяются в состоянии агрегата)
		aggregate
			.filter((el) => el._id === clr.aggregateListId)
			.forEach((el) => {
				result[clr._id].aggregate = result[el._id]
			})
		// Соленоид - холод
		clr.solenoid.forEach((el) => {
			// Добавляем модуль ПЛК на который привязан соленоид
			arrM.add(findMdl(binding, el._id))
			// сигнал соленоида "полное открытие"
			const sig = signal.find((e) => e.owner.id === el._id)
			arrM.add(sig?.module?.id)
			if (result?.[sig?._id] === undefined)
				result[clr._id].solenoid[el._id] = result?.outputEq?.[el._id]
			else result[clr._id].solenoid[el._id] = result?.[sig?._id]
		})
		// Напорные вентиляторы
		const arrFan = fan.filter((el) => el.owner.id === clr._id)
		arrFan.forEach((f) => {
			arrM.add(f?.module?.id)
			result[clr._id].fan[f._id] = result[f._id]
		})
		result[clr._id].fan.state = arrFan.every(
			(f) => result[f._id].state === 'off' || result[f._id].state === 'alarm'
		)
			? 'alarm'
			: ''

		// Оттайка испарителя
		heating
			.filter((el) => el.owner.id === clr._id && el.type == 'cooler')
			.forEach((h) => {
				arrM.add(h?.module?.id)
				result[clr._id].heating[h._id] = result?.outputEq?.[h._id]
			})
		// Соленоидs подогрева испарителя
		heating
			.filter((el) => el.owner.id === clr._id && el.type == 'channel')
			.forEach((h) => {
				arrM.add(h?.module?.id)
				result[clr._id].solHeat[h._id] = result?.outputEq?.[h._id]
			})
		// Датчики испарителя (температура всасывания, давления всасывания/нагентания)
		sensor
			.filter((el) => el.owner.id === clr._id)
			.forEach((s) => {
				if (s.type === 'cooler') arrM.add(s?.module?.id)
				result[clr._id].sensor[s._id] = result[s._id]
			})

		// Состояние испарителя
		result[clr._id].state = state(result[clr._id], clr, equip, arrM)
		// AO ВНО испарителя
		result[clr._id].ao = Object.values(result[clr._id].fan).find(
			(el) => el.value !== null || el.value !== undefined
		)?.value
		//Добавление читаемого названия состояния
		result[clr._id].name = coolerDef[result[clr._id]?.state] ?? ''
		// Кол-во запущенных ступеней (соленоидов охлаждения)
		const arr = Object.values(result[clr._id].solenoid)
		if (arr.length < 2) return
		const level = arr.reduce((acc, el, i) => {
			if (el) acc++
			return acc
		}, 0)
		result[clr._id].level = `${level} (${arr.length})`
	})
}
module.exports = cooler

/**
 * Состояние испарителя
 * @param {*} o
 * @param {*} clr
 * @param {*} building
 * @param {*} section
 * @returns
 */
function state(o, clr, equip, arrM) {
	const { solenoid, fan, heating } = o
	const { building, section } = equip
	const idB = getIdByClr(section, clr)
	const typeB = getB(building, idB)?.type
	// Модули ПЛК испраителя неисправны?
	// if (isAlrmByClr(clr, idB, equip, arrM)) {
	// 	o.status = 'alarm'
	// 	return 'off-off-off'
	// }
	// delete o?.status
	// Вычисление состояния
	// Соленоид - ВНО - Оттайка испарителя (off-off-off)
	const s = Object.values(solenoid ?? {}).some((el) => !!el) ?? false
	const f = Object.values(fan ?? {}).some((el) => el?.state === 'run') ?? false
	const h = Object.values(heating ?? {}).some((el) => !!el) ?? false
	const state = [s, f, h].map((el) => (el ? 'on' : 'off'))
	// Слив воды (аккумулятор автомата холодильника)
	const accAuto = readAcc(idB, typeB)

	if (typeB === 'combi') {
		// Комби склад
		if (accAuto?.cold?.[clr._id]?.state?.add) state.push('add')
	} else {
		// Склад холодильник
		if (accAuto?.[clr._id]?.state?.add) state.push('add')
	}
	return state.join('-')
}

const coolerDef = {
	'on-on-off': 'Охлаждение',
	'on-off-off': 'Набор холода',
	'off-on-off': 'Вентилятор',
	'off-off-on': 'Оттайка',
	'off-off-off': 'Пауза',
	'off-off-off-add': 'Слив',
}

/**
 * Модули ПЛК испарителя неисправны?
 * Поиск модулей к которым привязан испаритель
 * Проверка найденных модулей на неисправность
 * Если какой-либо модуль неисправен -> испаритель в аварии
 * @param {*} clr Рама испарителя
 * @param {*} idB ИД склада
 * @param {*} equip Рама оборудования
 * @param {*} arrM Коллекция неисправных модулей
 * @returns {boolean} true Неисправны / false Модули ОК
 */
function isAlrmByClr(clr, idB, equip, arrM) {
	return [...arrM].filter(el=>el).some((idM) => {
		const t = isErrM(idB, idM)
		const mdl = equip.module.find((el) => el._id === idM)
		console.log(
			`${clr.name} секции ${clr.sectionId}, Модуль ${idM} ${mdl?.ip}, авария=${t}`
		)
		return t
	})
}

/**
 *
 * @param {object[]} arr Рама (binding, signal, fan и т.д.)
 * @param {string} id ИД периферии
 * @returns {string} moduleId
 */
function findMdl(arr, id) {
	const elem = arr.find((el) => el.owner.id === id)
	return elem?.moduleId ?? elem?.module?.id
}
