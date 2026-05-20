const mes = require('@dict/message')
// Смена режимов секции
module.exports = (code, obj, oData) => {
	const { bld, sec, value, bId, sId } = web(code, obj, oData) ?? mobile(code, obj, oData) ?? {}

	let title = `${bld.name} ${bld.code}. ${sec.name} `
	if (value === null) title += 'выключена'
	else if (value === false) title += 'в ручном режиме'
	else title += 'в автоматическом режиме'

	return {
		title,
		value,
		bId,
		sId,
		type: 'mode',
	}
}

function web(code, obj, oData) {
	if (code !== 's_mode') return
	const { section, building } = oData
	const bId = Object.keys(obj)[0]
	const bld = building.find((el) => el._id == bId)
	const sId = Object.keys(obj[bId])[0]
	const value = obj[bId][sId]
	const sec = section.find((el) => el._id == sId)
	return { bld, sec, value, bId, sId }
}

function mobile(code, obj, oData) {
	if (code !== 'section') return
	const { section, building } = oData
	const bId = obj.buildingId
	const bld = building.find((el) => el._id == bId)
	const sId = obj.sectionId
	const value = obj.val
	const sec = section.find((el) => el._id == sId)
	return { bld, sec, value }
}
