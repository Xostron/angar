const { isAlr } = require('@tool/message/auto')
const { readAcc } = require('@store/index')
const { isCombiCold } = require('@tool/combi/is')
const { getIdsS } = require('@tool/get/building')
const { def } = require('@tool/command/fan/duration/prepare')
const { isExtra } = require('@tool/message/extra')

function fnPrepare(bld, obj, s, m) {
	// Удаление co2 в работе
	const CO2work = isExtra(bld._id, null, 'co2', 'work')
	const am = obj.retain?.[bld._id]?.automode
	// Комби склад в режиме холодильника
	const isCC = isCombiCold(bld, am, s)
	// Комби склад в режиме обычного
	const isCN = !isCC
	// Обычный склад
	const isN = bld.type === 'normal'
	// Склад включен
	const start = obj.retain[bld._id].start
	// Массив секций
	const idsS = getIdsS(obj.data.section, bld._id)
	// Рабочие ВНО по всем секциям
	const fan = idsS.flatMap((idS) => m.sect[idS]?.fanS ?? [])
	// Есть ли хоть одна секция в авто
	const secAuto = idsS.some((idS) => obj.retain[bld._id].mode?.[idS])
	// Комби-холодильника: Достиг задания
	const ccFlagFinish = readAcc(bld._id, 'combi')?.cold?.flagFinish
	// Обычный, Комби-обычный: Достиг задания
	const flagFinish = def[bld.type](bld._id, am, isCN)
	// Авария авторежима
	const alrAuto = isAlr(bld._id, am)
	return {
		alrAuto,
		CO2work,
		am,
		isCC,
		isCN,
		isN,
		start,
		secAuto,
		ccFlagFinish,
		flagFinish,
		idsS,
		fan,
	}
}

// function isAccessTime(bld, obj) {
// 	const am = obj.retain?.[bld._id]?.automode
// 	const finish = isAchieve(bld._id, am, 'finish')
// 	const alrAuto = isAlr(bld._id, am)
// 	const openVin = isExtralrm(bld._id, null, 'openVin')
// 	if (!finish && !alrAuto && !openVin) return false
// 	return true
// }

module.exports = { fnPrepare }
