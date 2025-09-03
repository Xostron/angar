const { setTuneTime, setPos } = require('@tool/command/set')
const { stateV } = require('@tool/command/valve')
const { data: store } = require('@store')
const { isZero } = require('@tool/zero')

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
		for (const build in retain) {
			if (!retain?.[build]?.valvePosition) continue
			vlvPos = { ...vlvPos, [build]: { ...retain[build].valvePosition } }
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
 * Положение клапанов
 * @param {*} obj Текущее положение клапана
 * @param {*} data данные из файла json
 */
function cbPos(obj, data) {
	const result = data ? data : {}
	for (const build in obj) {
		result[build] = {
			...result[build],
			valvePosition: { ...result?.[build]?.valvePosition, ...obj[build] },
		}
	}
	// setPos(null)
	return result
}
/**
 * Калибровка клапанов
 * @param {*} obj результат калибровки
 * @param {*} data данные из файла json
 */
function cbTune(obj, data) {
	const result = data ? data : {}
	for (const build in obj) {
		result[build] = {
			...result[build],
			valve: { ...result?.[build]?.['valve'], ...obj[build] },
		}
	}
	setTuneTime(null)
	return result
}

/**
 * Потеря питания
 * @param {*} obj данные на запись
 * @param {*} data данные из файла json
 */
function cbSupply(obj, data) {
	const result = data ? data : {}
	for (const build in obj) {
		result[build] = {
			...result[build],
			supply: { ...result?.[build]?.['supply'], ...obj[build] },
		}
	}
	return result
}

/**
 * Окуривание
 * @param {*} obj результат калибровки
 * @param {*} data данные из файла json
 */
function cbSmoking(obj, data) {
	const result = data ? data : {}
	for (const build in obj) {
		result[build] = {
			...result[build],
			smoking: { ...result?.[build]?.smoking, ...obj[build] },
		}
		// Разрешение на запись (по завершению окуривания)
		if (check(obj, build, result[build])) {
			result[build].start = true
			result[build].setting.smoking.on = false
		}
	}
	return result
}

function check(obj, build, result) {
	if (!result.setting?.smoking?.on) return false
	const stop = obj[build].work === null && obj[build].wait === null
	return stop
}

/**
 * Обновление аккумулятора - пересечение данных файла (data) и данных итерации (obj) (по ключам)
 * Данные из файла копируются в obj (только пересечения)
 * Затем obj сохраняется в файл
 * @param {*} obj Данные итерации
 * @param {*} data Данные файла
 * @returns
 */
function cbAcc(obj, data) {
	// Проход по ключам аккумулятора (extralrm, extra, timer, auto ...)
	for (const key in obj) {
		if (key === 'achieve') continue
		// Запись пересечений obj c data
		all(obj[key], data[key])
	}
	const newO = { ...obj }
	delete newO?.achieve
	// delete obj?.achieve
	return newO
}

/**
 * obj - новые аварии, data - сохраненые аварии
 * Поиск пересечения между двумя объектами, результат мутированный obj,
 * в котором пересечения копируются из data
 * @param {*} data данные из файла (слудующая вложенность)
 * @param {*} obj данные из итерации (следующая вложенность)
 * @param {*} prev данные из итерации (предыдущая вложенность)
 * @param {*} key предыдущий ключ
 * @returns
 */
function all(obj = {}, data = {}, prev, key) {
	const keys = Object.keys(obj)
	for (const k of keys) {
		// Ключ есть в файле (пересечение obj c data)
		if (k in data) {
			if (typeof obj[k] !== 'object') {
				// console.log(555, key, prev, data)
				prev[key] = data
				return
			}
			// console.log(444, k, obj)
			all(obj[k], data[k], obj, k)
		}
	}
}

/**
 * 1 Мин температура продукта в режиме хранения (Сброс в null, если авторежим != хранению)
 * 2 Соxранение даты возникновения продукт достиг задания
 * @param {*} acc данные на сохранение
 * @param {*} data данные из файла
 * @returns
 */
function cbCooling(acc, data) {
	const result = data ? data : {}
	for (const bldId in acc) {
		result ??= {}
		result[bldId] ??= {}
		result[bldId].cooling ??= {}
		result[bldId].cooling.tprdMin =
			result[bldId].automode === 'cooling' ? acc?.[bldId]?.cooling?.tprdMin ?? null : null
		result[bldId].cooling.finish = acc?.[bldId]?.cooling?.finish
	}
	return result
}

/**
 * @description Зафиксировать время вкл/выкл склада
 * @param {*} bldId id склада
 * @param {*} data данные из retain файла
 */
function cbDatestop(bldId, data) {
	let result = data ? data : {}
	result[bldId] ??= {}

	if (result?.[bldId]?.start && !result[bldId]?.datestart) {
		result[bldId].datestop = null
		result[bldId].datestart = new Date()
	} else if (!result?.[bldId]?.start && !result[bldId]?.datestop) {
		result[bldId].datestop = new Date()
		result[bldId].datestart = null
	}
	return result
}

/**
 * @description Счетчик сушки в днях
 * @param {*} bldId id склада
 * @param {*} data данные из retain файла
 */
function cbDryingCount(bldId, data) {
	let result = data ? data : {}
	result[bldId] ??= {}
	result[bldId].drying ??= {}
	result[bldId].drying.acc ??= 0
	// Фиксируем точку отсчета работы сушки
	if (
		result?.[bldId]?.start &&
		result[bldId]?.automode == 'drying' &&
		!result[bldId]?.drying?.date
	) {
		result[bldId].drying.date = new Date()
	}
	// Сушка выключена / склад выключен - сохраняем в аккумулятор
	if (
		(!result?.[bldId]?.start || result[bldId]?.automode !== 'drying') &&
		result?.[bldId]?.drying?.date
	) {
		result[bldId].drying.acc = result[bldId].drying.count
		delete result?.[bldId]?.drying?.date
		delete result?.[bldId]?.drying?.count
	}

	const dt = result?.[bldId]?.drying?.date

	// Нажата кнопка обнулить
	if (isZero(bldId)) {
		result[bldId].drying = { acc: 0 }
	}

	// Подсчет дней
	if (dt) {
		const dd = typeof dt == 'string' ? new Date(dt) : dt
		result[bldId].drying.count =
			result[bldId].drying.acc + (new Date() - dd) / (24 * 60 * 60 * 1000)
	}

	return result
}

module.exports = {
	positionVlv,
	cbPos,
	cbTune,
	cbSupply,
	cbSmoking,
	cbAcc,
	cbCooling,
	cbDatestop,
	cbDryingCount,
}
