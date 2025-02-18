const mes = require('@dict/message')
const { conv } = require('@tool/conv')
// Авторежимы
module.exports = (code, obj, oData) => {
	const { building } = oData
	const bId = obj?._id ?? obj.buildingId
	const bld = building.find((el) => el._id == bId)
	return {
		title: `${bld.name} ${bld.code}: ` + mes[502].msg + ` (${conv('automode', obj.val, 0)})`,
		value: obj.val,
		type: 'automode',
	}
}
