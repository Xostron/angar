const { data: store } = require('@store/index')
const { fnSens } = require('../bld/fn')
const { fnSMode, fnSFan, fnVlv, clrMode } = require('./fn')

/**
 * Карточка секции
 * @param {*} obj
 * @returns
 */
function fnSCard(obj) {
	if (!obj.data?.building || !obj.data?.section) return null

	return obj.data.section.reduce((acc, sec) => {
		const idB = sec.buildingId
		const bld = obj.data.building.find((el) => el._id === idB)
		// Режим работы: агрегация режимов секций
		acc[sec._id] = {
			order: sec.order ?? '--',
			name: sec.name ?? '--',
			mode: fnSMode(idB, sec._id, bld.type, obj?.retain),
			min: fnSens(sec._id, obj, 'tprd')?.min ?? '--',
			max: fnSens(sec._id, obj, 'tprd')?.max ?? '--',
			fan: fnSFan(sec._id, obj) ? 'Вкл' : 'Выкл',
			valve: fnVlv(sec._id, obj),
			combiMode: clrMode(idB, sec._id, obj)?.name,
		}
		return acc
	}, {})
}

// store.value = { ...obj.value, retain:obj.retain, factory:obj.factory, alarm: r }
module.exports = { fnSCard }
