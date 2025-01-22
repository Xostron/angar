const { data: store, setPos, setTuneTime, setTick } = require("@store")
const { stateV } = require("@tool/command/valve")

// Прогресс открытия/закрытия клапана (сохранение в retain)
function positionVlv(obj) {
	const { output, data, value, retain } = obj
	data.valve?.forEach((vlv) => {
		const idOn = vlv?.module?.on?.id
		if (!idOn) return
		const buildingId = output[idOn].buildingId
		const section = data.section.find((s) => vlv.sectionId.includes(s._id))
		const total = retain?.[section?.buildingId]?.valve?.[vlv._id]
		const state = stateV(
			vlv._id,
			value,
			section?.buildingId,
			vlv.sectionId[0]
		)
		// Текущее положение клапана из retain
		let vlvPos
		for (const build in retain) {
			if (!retain?.[build]?.valvePosition) continue
			vlvPos = { ...vlvPos, [build]: { ...retain[build].valvePosition } }
		}

		// открывается
		if (state === "iopn") {
			const cur = vlvPos?.[buildingId][vlv._id] + store._cycle_ms_
			// ограничение диапазона хода
			const value = cur > total ? total : cur
			// Сохранить в стор
			setPos({ _id: vlv._id, _build: buildingId, value })
		}

		// закрывается
		if (state === "icls") {
			const cur = vlvPos?.[buildingId]?.[vlv?._id] - store._cycle_ms_
			// ограничение диапазона хода
			const value = cur < 0 ? 0 : cur
			setPos({ _id: vlv._id, _build: buildingId, value })
		}

		// Открыт
		if (state === "opn")
			setPos({ _id: vlv._id, _build: buildingId, value: total })
		// Закрыт
		if (state === "cls")
			setPos({ _id: vlv._id, _build: buildingId, value: 0 })
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
			valve: { ...result?.[build]?.["valve"], ...obj[build] },
		}
	}
	setTuneTime(null)
	return result
}

/**
 * Потеря питания
 * @param {*} obj результат калибровки
 * @param {*} data данные из файла json
 */
function cbSupply(obj, data) {
	const result = data ? data : {}
	for (const build in obj) {
		result[build] = {
			...result[build],
			supply: { ...result?.[build]?.["supply"], ...obj[build] },
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
 * Обновление аккумулятора - пересечение данных файла и данных итерации (по ключам)
 * Данные файла остаются нетронутыми только те объекты,
 * которые имеются в данных итерации
 * Только для extralrm
 * @param {*} obj Данные итерации
 * @param {*} data Данные файла
 * @returns
 */
function cbAcc(obj, data) {
	// Проход по ключам аккумулятора (extralrm, extra, timer ...)
	for (const key in obj) {
		// запись пересечений obj c data
		all(obj[key], data[key])
	}
	return obj
}

/**
 * obj - актуальные аварии, data - сохраненые аварии
 * Поиск пересечения между двумя объектами, результат мутированный obj,
 * в котором пересечения копируются из data
 * @param {*} data данные из файла (слудующая вложенность)
 * @param {*} obj данные из итерации (следующая вложенность)
 * @param {*} prev данные из итерации (предыдущая вложенность)
 * @param {*} key предыдущий ключ
 * @returns
 */
function all(obj, data, prev, key) {
	const keys = Object.keys(obj)
	// console.log(111, key, obj, keys)
	for (const k of keys) {
		// Ключ есть в файле (пересечение obj c data)
		if (k in data) {
			if (typeof obj[k] !== "object") {
				// console.log(555, key, prev, data)
				prev[key] = data
				return
			}
			// console.log(444, k, obj)
			all(obj[k], data[k], obj, k)
		}
	}
}
// function fromFile(keysBld, ksBld, data, obj) {
// 	keysBld.forEach((bld) => {
// 		// Ключ склада не найден в итерации (новых аварий не обнаружено) - удаляем все аварии склада из файла
// 		if (!ksBld.includes(bld)) {
// 			delete data.extralrm[bld]
// 			return
// 		}
// 		// Ключ склада найден в итерации -> добавление/удаление/без_изменений аварий склада
// 		const ksAlr = Object.keys(obj.extralrm[bld])
// 		const keysAlr = Object.keys(data.extralrm[bld])

// 		// По авариям склада из файла (удаление,без_изменений)
// 		keysAlr.forEach((el) => (!ksAlr.includes(el) ? delete data.extralrm[bld][el] : null))
// 		// Добавление новых аварий из итерации
// 		ksAlr.forEach((el) => (!keysAlr.includes(el) ? (data.extralrm[bld][el] = obj.extralrm[bld][el]) : null))
// 	})
// }

// function fromIter(keysBld, ksBld, data, obj) {
// 	ksBld.forEach((bld) => {
// 		// Склад уже записан в файл - пропускаем
// 		if (keysBld.includes(bld)) return
// 		// Добавляем склад в файл
// 		data.extralrm[bld] = obj.extralrm[bld]
// 	})
// }

// function all(data, obj) {
// 	const adata = Object.keys(data[key])
// 	const aobj = Object.keys(obj[key])
// 	const r = new Set([...Object.keys(data[key]), ...Object.keys(data[key])])
// 	keys.forEach((key) => {
// 		// Ключа нет в объекте итерации - удалить из файла
// 		if (!(key in obj)) {
// 			delete data[key]
// 			return
// 		}
// 		// Ключ есть в объекте итерации
// 		// Ключа нет в файле - добавить в файл
// 		if (!(key in data)) {
// 			data ??= {}
// 			data[key] = obj[key]
// 			return
// 		}
// 		// Ключ есть в файле
// 		// all()
// 	})
// }

// function intersection(data,obj){
// 	data
// }

// function getKeys(o){
// 	const keys = Object.keys(o)
// 	keys.forEach(k =>{
// 		if (typeof o[k] !== 'object') return
// 		getKeys(o)
// 	})
// 	return keys
// }

module.exports = { positionVlv, cbPos, cbTune, cbSupply, cbSmoking, cbAcc }
