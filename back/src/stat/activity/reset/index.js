// Сброс аварии
module.exports = function reset(code, obj, oData) {
	const { building } = oData
	const bId = obj?.buildingId
	const bld = building.find((el) => el._id == bId)
	return { bId, type: 'reset', title: `${bld.name} ${bld.code}: Сброс аварии` }
}
