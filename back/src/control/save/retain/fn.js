const { setTuneTime, setPos } = require('@tool/command/set')
const { curStateV } = require('@tool/command/valve')
const { isZero, zero } = require('@tool/zero')
const { data: store } = require('@store')

// Прогресс открытия/закрытия клапана (сохранение в retain)
function positionVlv(obj) {
	const { data, value, retain } = obj
	data.valve?.forEach((vlv) => {
		const idOn = vlv?.module?.on?.id
		if (!idOn) return
		const section = data.section.find((s) => vlv.sectionId.includes(s._id))
		const buildingId = section.buildingId
		const total = retain?.[buildingId]?.valve?.[vlv._id]
		const state = curStateV(vlv._id, value)
		// Текущее положение клапана из retain
		let vlvPos
		for (const idB in retain) {
			if (!retain?.[idB]?.valvePosition) continue
			vlvPos = { ...vlvPos, [idB]: { ...retain[idB].valvePosition } }
		}

		// Частично открыт (Клапан остановлен и находится в промежуточном положении)
		if (state === 'popn') {
			const cur = vlvPos?.[buildingId]?.[vlv._id]
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
			console.log(1234,value)
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
		// Правило для окуривания | озонатора (key==='smoking' | 'ozon')
		finishSmokingOzon(data[idB], store.retain[idB], key)
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
function finishSmokingOzon(dataB, resultB, key) {
	if (key !== 'smoking' && key !== 'ozon') return
	if (!resultB?.setting?.[key]?.on) return
	if (dataB.work !== null || dataB.wait !== null) return
	resultB.start = true
	resultB.setting ??= {}
	resultB.setting[key] ??= {}
	resultB.setting[key].on = false
}

/**
 * Данные режима хранения
 * tprdMin
 * finish
 * @param {*} data Текущее состояние процесса
 * @returns
 */
function fnCooling(data, building) {
	if (!data) return
	for (const { _id: idB } of building) {
		const am = store.retain[idB].automode
		store.retain[idB][am] ??= {}
		// Мин. темп. продукта в режиме хранения
		store.retain[idB][am].tprdMin =
			store.retain[idB].automode === 'cooling' || store.retain[idB].automode === 'defrost'
				? (data?.[idB]?.[am]?.tprdMin ?? data?.[idB]?.combi?.tprdMin)
				: null
		// Дата и время: продукт достиг задания в режиме хранения
		if (store.retain[idB].automode === 'cooling' || store.retain[idB].automode === 'defrost')
			store.retain[idB][am].finish = data?.[idB]?.[am]?.finish ?? data?.[idB]?.combi?.finish
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

module.exports = {
	positionVlv,
	fnResult,
	fnCooling,
	fnDateBuild,
	fnResultValve,
}
