const { data: store, dataDir, stateDir, retainDir } = require('@store')
const { readTO, readOne } = require('@tool/json')
const fsp = require('fs').promises
const transformStore = require('@routes/api/tenta/read/store/transform')
const transformPC = require('@routes/api/tenta/read/pc/transform')
const _OBJECT_ID_LENGTH = 24
/**
 *
 * @returns {object}	result Данные по датчикам (для Tenta админки),
 * 						hub: {init:boolean, last:boolean, state:object}
 * 							init Инициализация пройдена,
 * 							last Предыдущая передача данных прошла успешна
 * 							state Данные по датчикам (предыдущее состояние)
 * 						value Данные по датчикам (для расчета delta)
 */
async function preparing() {
	let value = {},
		valDelta
	const hub = store.hub
	// Рама pc
	const files = (await fsp.readdir(dataDir)).filter((el) => el.includes('json'))
	const data = await readTO(files)

	// Получение данных от ЦС (вкл/выкл : true/false)
	if (!data?.pc?.state?.on) {
		console.log('\x1b[33m%s\x1b[0m', 'Получение данных от ЦС выключен')
		return null
	}

	// Собираем значения по складу
	if (!Object.keys(store.value).length) {
		console.log('\x1b[33m%s\x1b[0m', 'Данные от ЦС еще не готовы')
		return null
	}

	// Карточки PC
	const resPC = transformPC(store.value, data.building)
	// console.log(551, resPC)

	// Полное содержимое секции и карточки секций
	for (const sec of data.section) value[sec._id] = await transformStore(sec.buildingId, sec._id)
	// console.log(555, value)

	// Преобразуем в одноуровневый объект с составными ключами
	value = { ...convertPC(resPC), ...convertSec(value) }
	// console.log(5551, value)

	// Расчет delta (первое включение прошло успешно hub.init = true)
	valDelta = hub.init ? delta(value, hub.state) : null
	// console.log(55551, valDelta)

	// Формируем данные для Tenta
	const result = convertTenta(valDelta ?? value, data.pc._id)
	// console.log(5553, result)
	return { result, hub, value }
}

// PC  =  карточки складов
function convertPC(obj) {
	let r = {}
	for (const fld in obj) {
		if (['ah', 'rh', 'temp'].includes(fld)) r[fld] = obj[fld]
		else {
			const bldId = fld.slice(0, _OBJECT_ID_LENGTH)
			r[bldId + '.' + fld] = obj[fld]
		}
	}
	return r
}

// Секция = Полное описание секции + карточки секций + некоторая инфа по складу
function convertSec(obj) {
	let r = { buildings: new Set() }
	for (const secId in obj) {
		const bldId = obj[secId].bldId
		delete obj[secId].bldId
		// Поля склада и карточек секций
		if (!r.buildings.has(bldId)) {
			r.buildings.add(bldId)
			r = { ...r, ...convert(obj[secId], bldId) }
			r[`${bldId}.sections`] ??= []
			r[`${bldId}.sections`].push(secId)
		}
		// Полное описание секции
		// console.log(22, obj[secId].valve?.[secId])
		r = { ...r, ...convert(obj[secId].value, `${secId}`) }
		if (obj[secId].valve?.[secId]) r = { ...r, [secId + '.valve']: obj[secId].valve?.[secId] }
	}
	r.buildings = [...r.buildings]
	return r
}

function convert(obj, key) {
	const r = {}
	for (const fld in obj) ['rh', 'ah', 'temp', 'value', 'valve'].includes(fld) ? null : (r[`${key}.${fld}`] = obj[fld])
	return r
}

// Преобразование данных для Tenta
function convertTenta(value, pcId) {
	const r = []
	for (const key in value) {
		const fld = key.split('.')
		// console.log(fld)
		const o = {
			key: fld.pop(),
			value: value[key],
			owner: !fld.length ? pcId : fld.pop(),
		}
		r.push(o)
	}

	return r
}

// Расчет delta изменений
function delta(value, old) {
	const r = {}
	for (const key in value) {
		value[key]
		switch (typeof value[key]) {
			case 'object':
				// Объекты
				if (JSON.stringify(value[key]) !== JSON.stringify(old[key])) r[key] = value[key]
				break
			default:
				// Простые данные: числа, строки, null, undefined
				if (value[key] !== old[key]) r[key] = value[key]
				break
		}
	}
	// console.log(5551, r)
	return r
}

module.exports = { preparing, convertSec, convertTenta, delta }
