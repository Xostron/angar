const { setTuneTime, setPos } = require('@tool/command/set')
const { stateV } = require('@tool/command/valve')
const { isZero } = require('@tool/zero')
const { data: store } = require('@store')

// Прогресс открытия/закрытия клапана (сохранение в retain)
function positionVlv(obj) {
	const { output, data, value, retain } = obj
	data.valve?.forEach((vlv) => {
		const idOn = vlv?.module?.on?.id
		if (!idOn) return
		// console.log(333, output, idOn)
		const buildingId = output[idOn].buildingId
		const section = data.section.find((s) => vlv.sectionId.includes(s._id))
		const total = retain?.[section?.buildingId]?.valve?.[vlv._id]
		const state = stateV(vlv._id, value, section?.buildingId, vlv.sectionId[0])
		// Текущее положение клапана из retain
		let vlvPos
		for (const idB in retain) {
			// console.log('\x1b[0m', '@@@@@@@@@@@@@@@@@@')
			if (!retain?.[idB]?.valvePosition) continue
			// console.log('idB', idB)
			vlvPos = { ...vlvPos, [idB]: { ...retain[idB].valvePosition } }
		}

		// Частично открыт (Клапан остановлен и находится в промежуточном положении)
		if (state==='popn'){
			const cur = vlvPos?.[buildingId][vlv._id]
			// ограничение диапазона хода
			let value = cur > total ? total : cur
			value = cur < 0 ? 0 : cur
			// Сохранить в стор
			setPos({ _id: vlv._id, _build: buildingId, value })
		}

		// открывается
		if (state === 'iopn') {
			const cur = vlvPos?.[buildingId][vlv._id] + store._cycle_ms_
			// ограничение диапазона хода
			const value = cur > total ? total : cur
			// Сохранить в стор
			setPos({ _id: vlv._id, _build: buildingId, value })
		}

		// закрывается
		if (state === 'icls') {
			const cur = vlvPos?.[buildingId]?.[vlv?._id] - store._cycle_ms_
			// ограничение диапазона хода
			const value = cur < 0 ? 0 : cur
			setPos({ _id: vlv._id, _build: buildingId, value })
		}

		// Открыт
		if (state === 'opn') setPos({ _id: vlv._id, _build: buildingId, value: total })
		// Закрыт
		if (state === 'cls') setPos({ _id: vlv._id, _build: buildingId, value: 0 })
	})
}

/**
 * Собираем данные в result
 * @param {*} data Текущее состояние процесса
 * @param {*} result Данные на сохранение
 * @param {string} key Ключ по которому хранится инфа(например, valvePosition - позиции клапана)
 * @param {object} prime Данные из файла
 */
function fnResult(data, result, key) {
	if (!data) return
	for (const idB in data) {
		result[idB][key] = data[idB]
		// Правило для окуривания (key==='cooling')
		finishSmoking(data[idB], result[idB], key)
	}
}

function fnResultValve(data, result, key) {
	if (!data) return
	for (const idB in data) {
		result[idB][key] ??= {}
		result[idB][key] = { ...result[idB][key], ...data[idB] }
		if (key === 'valve') setTuneTime(null)
	}
}

/**
 * По истечению окуривания, включаем склад и выключаем окуривание в настройках
 * @param {*} dataB Текущее состояние процесса для склада
 * @param {*} resultB Данные на сохранение для склада
 * @param {string} key Ключ по которому хранится инфа(например, valvePosition - позиции клапана)
 * @returns
 */
function finishSmoking(dataB, resultB, key) {
	if (key !== 'smoking') return
	if (dataB.work !== null || dataB.wait !== null) return
	if (!resultB?.setting?.smoking?.on) return
	resultB.start = true
	resultB.setting ??= {}
	resultB.setting.smoking ??= {}
	resultB.setting.smoking.on = false
}

/**
 * Данные режима хранения
 * @param {*} data Текущее состояние процесса
 * @param {*} result Данные на сохранение
 * @returns
 */
function fnCooling(data, result) {
	if (!data) return
	for (const idB in data) {
		result[idB].cooling ??= {}
		// Мин. темп. продукта в режиме хранения
		result[idB].cooling.tprdMin =
			result[idB].automode === 'cooling' ? data?.[idB]?.cooling?.tprdMin ?? null : null
		// Дата и время: продукт достиг задания в режиме хранения
		result[idB].cooling.finish = data?.[idB]?.cooling?.finish
	}
}

/**
 * Дата и время: вкл/выкл склада
 * @param {object[]} building Массив складов
 * @param {object} result Данные на сохранение
 */
function fnDateBuild(building, result) {
	for (const { _id: idB } of building) {
		if (result?.[idB]?.start && !result[idB]?.datestart) {
			result[idB].datestop = null
			result[idB].datestart = new Date()
		} else if (!result?.[idB]?.start && !result[idB]?.datestop) {
			result[idB].datestop = new Date()
			result[idB].datestart = null
		}
	}
}

/**
 * Счетчик дней в авторежиме сушки
 * @param {object[]} building Массив складов
 * @param {object} result Данные на сохранение
 */
function fnDryingCount(building, result) {
	for (const { _id: idB } of building) {
		result[idB].drying ??= {}
		result[idB].drying.acc ??= 0

		// Фиксируем точку отсчета работы сушки
		if (
			result?.[idB]?.start &&
			result[idB]?.automode == 'drying' &&
			!result[idB]?.drying?.date
		) {
			result[idB].drying.date = new Date()
		}
		// Сушка выключена / склад выключен - сохраняем в аккумулятор
		if (
			(!result?.[idB]?.start || result[idB]?.automode !== 'drying') &&
			result?.[idB]?.drying?.date
		) {
			result[idB].drying.acc = result[idB].drying.count
			delete result?.[idB]?.drying?.date
			delete result?.[idB]?.drying?.count
		}

		const dt = result?.[idB]?.drying?.date

		// Нажата кнопка обнулить
		if (isZero(idB)) {
			result[idB].drying = { acc: 0 }
		}

		// Подсчет дней
		if (dt) {
			const dd = typeof dt == 'string' ? new Date(dt) : dt
			result[idB].drying.count =
				result[idB].drying.acc + (new Date() - dd) / (24 * 60 * 60 * 1000)
		}
	}
}

module.exports = { positionVlv, fnResult, fnCooling, fnDateBuild, fnDryingCount, fnResultValve }
