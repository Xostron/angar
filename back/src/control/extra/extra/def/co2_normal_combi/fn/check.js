const { isAchieve } = require('@tool/message/achieve')
const { isAlr } = require('@tool/message/auto')
const { isExtralrm } = require('@tool/message/extralrm')
const { delExtra, wrExtra } = require('@tool/message/extra')
const def = require('./index')

module.exports = function check(bld, obj, acc, o) {
	// Авторежимы: dryinc, cooling
	const am = obj.retain?.[bld._id]?.automode
	// Температура продукта достигла задания
	const finish = isAchieve(bld._id, am, 'finish')
	// Авария авторежима
	const alrAuto = isAlr(bld._id, am)
	// Авария температура канала выше температуры продукта
	const openVin = isExtralrm(bld._id, null, 'openVin')
	if (finish || alrAuto || openVin) {
		console.log(
			1111,
			`Проверка СО2 - включение: достиг задания ${finish}, авария авторежима ${alrAuto}, tcnl > tprd ${openVin} `
		)
		return true
	}
	console.log(
		1111,
		`Проверка СО2 - Выключение: достиг задания ${finish}, авария авторежима ${alrAuto}, tcnl > tprd ${openVin}`
	)
	delExtra(bld._id, null, 'co2', 'co2_wait')
	def.clear(acc, 'work', 'wait', 'start')
	return false
}


