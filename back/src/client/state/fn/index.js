const { data: store, dataDir, stateDir, retainDir } = require('@store')
const { readTO, readOne } = require('@tool/json')
const fsp = require('fs').promises
const transformStore = require('@routes/api/tenta/read/store/transform')
const transformPC = require('@routes/api/tenta/read/pc/transform')

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
	// Полное содержимое секции
	for (const sec of data.section) value[sec._id] = await transformStore(sec.buildingId, sec._id)
	// Преобразуем в одноуровневый объект с составными ключами
	value = { ...convertPC(resPC), ...convertSec(value) }

	// Расчет delta (первое включение прошло успешно hub.init = true)
	valDelta = hub.init ? delta(value, hub.state) : null

	// Формируем данные для Tenta
	const result = convertTenta(valDelta ?? value, data.pc._id)

	return { result, hub, value }
}

// PC  =  карточки складов
function convertPC(obj) {
	let r = {}
	const buildings = Object.keys(obj.list)
	if (!buildings.length) return
	r.buildings = buildings
	r.temp = obj.temp
	r.rh = obj.rh
	r.ah = obj.ah
	// console.log(666, r)
	for (const bldId in obj.list) r = { ...r, ...convert(obj.list[bldId], bldId) }
	return r
}

// Секция = Полное описание секции + карточки секций + некоторая инфа по складу
function convertSec(obj) {
	let r = { buildings: new Set() }
	for (const secId in obj) {
		const bldId = obj[secId]._id
		// Поля склада
		if (!r.buildings.has(bldId)) {
			r.buildings.add(bldId)
			delete obj[secId]._id
			delete obj[secId].value.vheating
			r = { ...r, ...convert(obj[secId], bldId) }
			delete r[`${bldId}.sections`]
			delete r[`${bldId}.value`]
			// Карточки секций
			for (const sId in obj[secId].sections) {
				delete obj[secId].sections[sId]._id
				// Клапаны
				const valve = convert(obj[secId].sections[sId].valve, sId)
				delete obj[secId].sections[sId].valve
				// секция
				r = { ...r, ...convert(obj[secId].sections[sId], `${sId}`), ...valve }
			}
			r[`${bldId}.sections`] = Object.keys(obj)
		}
		// Полное описание секции
		r = { ...r, ...convert(obj[secId].value, `${secId}`) }
	}
	r.buildings = [...r.buildings]
	return r
}

function convert(obj, key) {
	const r = {}
	for (const fld in obj) r[`${key}.${fld}`] = obj[fld]
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
	return r
}

// // Склад  = карточки секций + некоторая инфа по складу
// function convertBld(obj) {
// 	let r = {}
// 	const buildings = Object.keys(obj)
// 	if (!buildings.length) return
// 	r.buildings = buildings
// 	// По складам
// 	for (const bldId in obj) {
// 		delete obj[bldId]._id
// 		// Поля склада
// 		r = { ...r, ...convert(obj[bldId], bldId) }
// 		delete r[`${bldId}.sections`]
// 		delete r[`${bldId}.value`]
// 		r[`${bldId}.sections`] = Object.keys(obj[bldId].sections)
// 		// По секции
// 		for (const secId in obj[bldId].sections) {
// 			delete obj[bldId].sections[secId]._id
// 			// Поля sections
// 			r = { ...r, ...convert(obj[bldId].sections[secId], `${bldId}.${secId}`) }
// 		}
// 		// поля Value
// 		r = { ...r, ...convert(obj[bldId].value, `${bldId}.value`) }
// 	}
// 	return r
// }

module.exports = { preparing, convertPC, convertSec, convertTenta, delta }
