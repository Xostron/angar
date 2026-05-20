const mes = require('@dict/message')
// Пуск склада
module.exports = (code, obj, oData) => {
	const { building } = oData
	const bId = obj?._id ?? obj.buildingId
	const bld = building.find((el) => el._id == bId)
	return {
		title: `${bld.name} ${bld.code}: ` + (obj.val ? mes[500].msg : mes[501].msg),
		value: obj.val,
		type: 'start',
	}
}
