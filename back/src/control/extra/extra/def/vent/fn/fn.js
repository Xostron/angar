const { isExtralrm } = require('@tool/message/extralrm')
const { isAchieve } = require('@tool/message/achieve')
const { isAlr } = require('@tool/message/auto')
const { readAcc } = require('@store/index')
const { isCombiCold } = require('@tool/combi/is')
const { getIdsS } = require('@tool/get/building')

function fnPrepare(bld, obj, s) {
	const extraCO2 = readAcc(bld._id, 'building', 'co2')
	const am = obj.retain?.[bld._id]?.automode
	// Комби склад в режиме холодильника
	const isCC = isCombiCold(bld, am, s)
	// Комби склад в режиме обычного
	const isCN = !isCC
	// Обычный склад
	const isN = bld.type === 'normal'
	// Склад выключен
	const start = obj.retain[bld._id].start
	// Секция в авто
	const idsS = getIdsS(obj.data.section, bld._id)
	const secAuto = idsS.some((idS) => obj.retain[bld._id].mode?.[idS])
	// Комби склад в режиме холодильника - флаг выкл по достижению задания
	const cFlagFinish = readAcc(bld._id, 'combi')?.cold?.flagFinish
	return { extraCO2, am, isCC, isCN, isN, start, secAuto, cFlagFinish, idsS }
}

function isAccessTime(bld, obj) {
	const am = obj.retain?.[bld._id]?.automode
	const finish = isAchieve(bld._id, am, 'finish')
	const alrAuto = isAlr(bld._id, am)
	const openVin = isExtralrm(bld._id, null, 'openVin')
	if (!finish && !alrAuto && !openVin) return false
	return true
}

module.exports = { fnPrepare, isAccessTime }
