const { setTuneTime, setPos } = require('@tool/command/set')
const { curStateV } = require('@tool/command/valve')
const { isZero } = require('@tool/zero')
const { data: store } = require('@store')

// Прогресс открытия/закрытия клапана (сохранение в retain)
function positionVlv(obj) {
	const { output, data, value, retain } = obj
	data.valve?.forEach((vlv) => {
		const idOn = vlv?.module?.on?.id
		if (!idOn) return
		const buildingId = output[idOn].buildingId
		const section = data.section.find((s) => vlv.sectionId.includes(s._id))
		const total = retain?.[section?.buildingId]?.valve?.[vlv._id]
		const state = curStateV(vlv._id, value)
		// Текущее положение клапана из retain
		let vlvPos
		for (const idB in retain) {
			if (!retain?.[idB]?.valvePosition) continue
			vlvPos = { ...vlvPos, [idB]: { ...retain[idB].valvePosition } }
		}

		// Частично открыт (Клапан остановлен и находится в промежуточном положении)
		if (state === 'popn') {
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
 * Собираем данные в store.retain
 * @param {*} data Текущее состояние процесса
 * @param {string} key Ключ по которому хранится инфа(например, valvePosition - позиции клапана)
 * @param {object} prime Данные из файла
 */
function fnResult(data, key) {
	if (!data) return
	for (const idB in data) {
		store.retain[idB][key] = data[idB]
		// Правило для окуривания (key==='cooling')
		finishSmoking(data[idB], store.retain[idB], key)
	}
}

function fnResultValve(data, key) {
	if (!data) return
	for (const idB in data) {
		store.retain[idB][key] ??= {}
		store.retain[idB][key] = { ...store.retain[idB][key], ...data[idB] }
		if (key === 'valve') setTuneTime(null)
	}
}

/**
 * По истечению окуривания, включаем склад и выключаем окуривание в настройках
 * При включенном складе сброс окуривания
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
 * tprdMin
 * finish
 * @param {*} data Текущее состояние процесса
 * @returns
 */
function fnCooling(data) {
	if (!data) return
	for (const idB in data) {
		// console.log('5500', data[idB])
		store.retain[idB].cooling ??= {}
		// Мин. темп. продукта в режиме хранения
		store.retain[idB].cooling.tprdMin =
			store.retain[idB].automode === 'cooling'
				? data?.[idB]?.cooling?.tprdMin ?? data?.[idB]?.combi?.tprdMin
				: null
		// Дата и время: продукт достиг задания в режиме хранения
		store.retain[idB].cooling.finish =
			data?.[idB]?.cooling?.finish ?? data?.[idB]?.combi?.finish
	}
}

/**
 * Дата и время: вкл/выкл склада
 * @param {object[]} building Массив складов
 */
function fnDateBuild(building) {
	for (const { _id: idB } of building) {
		if (store.retain?.[idB]?.start && !store.retain[idB]?.datestart) {
			store.retain[idB].datestop = null
			store.retain[idB].datestart = new Date()
		} else if (!store.retain?.[idB]?.start && !store.retain[idB]?.datestop) {
			store.retain[idB].datestop = new Date()
			store.retain[idB].datestart = null
		}
	}
}

/**
 * Счетчик дней в авторежиме сушки
 * @param {object[]} building Массив складов
 */
function fnDryingCount(building) {
	for (const { _id: idB } of building) {
		store.retain[idB].drying ??= {}
		store.retain[idB].drying.acc ??= 0

		// Фиксируем точку отсчета работы сушки
		if (
			store.retain?.[idB]?.start &&
			store.retain[idB]?.automode == 'drying' &&
			!store.retain[idB]?.drying?.date
		) {
			store.retain[idB].drying.date = new Date()
		}
		// Сушка выключена / склад выключен - сохраняем в аккумулятор
		if (
			(!store.retain?.[idB]?.start || store.retain[idB]?.automode !== 'drying') &&
			store.retain?.[idB]?.drying?.date
		) {
			store.retain[idB].drying.acc = store.retain[idB].drying.count
			delete store.retain?.[idB]?.drying?.date
			delete store.retain?.[idB]?.drying?.count
		}

		const dt = store.retain?.[idB]?.drying?.date

		// Нажата кнопка обнулить
		if (isZero(idB)) {
			store.retain[idB].drying = { acc: 0 }
		}

		// Подсчет дней
		if (dt) {
			const dd = typeof dt == 'string' ? new Date(dt) : dt
			store.retain[idB].drying.count =
				store.retain[idB].drying.acc + (new Date() - dd) / (24 * 60 * 60 * 1000)
		}
	}
}

module.exports = {
	positionVlv,
	fnResult,
	fnCooling,
	fnDateBuild,
	fnDryingCount,
	fnResultValve,
}
