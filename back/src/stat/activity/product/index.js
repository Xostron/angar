const mes = require('@dict/message')

module.exports = (code, obj, oData) => {
	const { building } = oData
	console.log(222, obj)
	const bId = obj.buildingId
	const bld = building.find((el) => el._id == bId)
	// web
	let title = `${bld.name} ${bld.code}: ` + mes[503].msg + ` (${obj.name})`
	// мобильный
	if (obj.val) title= `${bld.name} ${bld.code}: ` + mes[503].msg + ` (${obj.val.name})`
	return {
		title,
		value: obj.code ?? obj.val.code,
		type: 'product',
	}
}
