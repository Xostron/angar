const transformPC = require('@routes/api/tenta/read/pc/transform')
const transformStore = require('../../routes/api/tenta/read/store/transform')
const { delay } = require('@tool/command/time')
const { preparing } = require('./fn')

async function state() {
	try {
		const o = await preparing()
		if (!o) return
		const { data, value, ref, last } = o
		// const { retain, alarm, total } = value

		// Карточки PC
		let resPC = transformPC(value, data.building)
		// resBld Карточки секций  || resSec секция
		// let resBld = {}
		// resSec Полное содержимое секция
		let resSec = {}

		// for (const bld of data.building) {
		// resBld[bld._id] = await transformStore(bld._id)
		for (const sec of data.section) {
			resSec[sec._id] = await transformStore(sec.buildingId, sec._id)
		}
		// }

		// Преобразуем ключи объекта
		// resPC = convertPC(resPC)
		// resBld = convertBld(resBld)
		resSec = { ...convertPC(resPC), ...convertSec(resSec) }
		// console.log(661, 'resPC', resPC)
		// console.log(662, 'resBld', resBld)
		console.log(663, 'resSec', JSON.stringify(resSec, null, ' '))
		// Данные переданы
		return true
	} catch (error) {
		console.error(666666, error)
	}
}

async function loopState() {
	while (true) {
		state()
			.then((ok) =>
				ok
					? console.log('\x1b[33m%s\x1b[0m', 'Режим опроса: Poll - данные POS переданы на сервер ')
					: console.log('\x1b[33m%s\x1b[0m', 'Режим опроса: Poll отключен')
			)
			.catch((err) => {
				// TODO Фиксировать не переданный state
			})
		// отправка состояния каждые 5 минут
		await delay(process.env?.PERIOD_STATE ?? 10000)
	}
}

module.exports = loopState

// PC  =  карточки складов
function convertPC(obj) {
	let r = {}
	const buildings = Object.keys(obj.list)
	if (!buildings.length) return
	r.buildings = buildings
	// console.log(666, r)
	for (const bldId in obj.list) r = { ...r, ...convert(obj.list[bldId], bldId) }
	return r
}
// Склад  = карточки секций + некоторая инфа по складу
function convertBld(obj) {
	let r = {}
	const buildings = Object.keys(obj)
	if (!buildings.length) return
	r.buildings = buildings
	// По складам
	for (const bldId in obj) {
		delete obj[bldId]._id
		// Поля склада
		r = { ...r, ...convert(obj[bldId], bldId) }
		delete r[`${bldId}.sections`]
		delete r[`${bldId}.value`]
		r[`${bldId}.sections`] = Object.keys(obj[bldId].sections)
		// По секции
		for (const secId in obj[bldId].sections) {
			delete obj[bldId].sections[secId]._id
			// Поля sections
			r = { ...r, ...convert(obj[bldId].sections[secId], `${bldId}.${secId}`) }
		}
		// поля Value
		r = { ...r, ...convert(obj[bldId].value, `${bldId}.value`) }
	}
	return r
}
// Секция = Полное описание секции + карточки секций + некоторая инфа по складу
function convertSec(obj) {
	let r = { buildings: new Set() }
	// console.log(6661, Object.keys(obj))
	for (const secId in obj) {
		const bldId = obj[secId]._id
		// console.log(6662, secId, bldId)
		// Поля склада
		if (!r.buildings.has(bldId)) {
			r.buildings.add(bldId)
			delete obj[secId]._id
			r = { ...r, ...convert(obj[secId], bldId) }
			delete r[`${bldId}.sections`]
			delete r[`${bldId}.value`]
			// Карточки секций
			for (const sId in obj[secId].sections) {
				delete obj[secId].sections[sId]._id
				r = { ...r, ...convert(obj[secId].sections[sId], `${bldId}.sections.${sId}`) }
			}
			r[`${bldId}.sections`] = Object.keys(obj)
		}
		// Полное описание секции
		r = { ...r, ...convert(obj[secId].value, `${bldId}.${secId}.value`) }
	}
	r.buildings = [...r.buildings]
	// console.log(6666, r.buildings)
	return r
}

function convert(obj, key) {
	const r = {}
	for (const fld in obj) r[`${key}.${fld}`] = obj[fld]
	return r
}
