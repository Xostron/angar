const { data: store, dataDir, stateDir, retainDir } = require('@store')
const { readTO, readOne } = require('@tool/json')
const fsp = require('fs').promises

/**
 *
 * @returns {object}	data - Рама,
 * 						value - Акутальные значения+retain,
 * 						ref - state.json Мясо (показания датчиков и т.д.)
 * 							опорный объект для вычисления delta изменений,
 * 						poll: {init:Date, last:Date} init - данные в state.json актуальны,
 * 							last краняя передача данных прошла успешна
 */
async function preparing() {
	// Рама
	const files = (await fsp.readdir(dataDir)).filter((el) => el.includes('json'))
	const data = await readTO(files)
	let ref
	// Режим опроса POS-AdminServer активен - true? (переключатель на PC)
	const isHub = data?.pc?.hub
	if (!isHub) return null
	// TODO Режим опроса: старый вариант /  новый вариант POS-admin
	// TODO Период опроса для каждого склада свой период / для POS (все склады одновременно)
	// Начальные данные из файла (основа для формирования delta изменений)
	if (store?.hub?.init) ref = await readOne('state.json', stateDir)
	// Актуальные значения с датчиков и оборудования
	const value = store.value
	// Последний опрос: true - успешен, false - Не успешен(сервер был перезапущен, ошибка сервера pos)
	return { data, value, ref, hub: store.hub }
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
				const valve = convert(obj[secId].sections[sId].valve)
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
	for (const fld in obj) {
		// именованный ключ
		if (fld.length != 24) r[`${key}.${fld}`] = obj[fld]
		// ключ Id
		else r[`${fld}`] = obj[fld]
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

module.exports = { preparing, convertPC, convertSec }
