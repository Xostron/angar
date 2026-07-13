const { data: store } = require('@store/index')

/**
 * Карточка склада
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
			fan: fnFan(sec._id, obj) ? 'Вкл' : 'Выкл',
			min: fnSens(sec._id, obj, 'tprd')?.min ?? '--',
			max: fnSens(sec._id, obj, 'tprd')?.max ?? '--',
			vin: {},
			vout: {},
		}
		return acc
	}, {})
}

module.exports = { fnSCard }

function fnSMode(idB, idS, bldType, retain = {}) {
	if (bldType === 'cold') return ['', '']
	switch (retain?.[idB]?.mode?.[idS]) {
		case true:
			return [true, 'Авто']
		case false:
			return [false, 'Руч']
		default:
			return [retain?.[idB]?.mode?.[idS], 'Выкл']
	}
}
