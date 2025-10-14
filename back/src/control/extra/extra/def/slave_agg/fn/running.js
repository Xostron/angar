const { isErrM } = require('@tool/message/plc_module')
/**
 * Условие пуска
 * @param {*} bld
 * @param {*} cmpr
 * @param {*} stateAgg
 * @param {*} acc
 * @param {*} pinV
 * @param {*} s
 */
function fnRunning(agg, bld, owner, cmpr, stateAgg, acc, pinV, obj, s) {
	const { pin = 0, hysteresisP = 0.2 } = bld.type === 'cold' ? s.cooler : s.coolerCombi
	// Авария питания, перегрев двигателя, высокое давление, уровень масла
	const alarm = stateAgg.state === 'alarm'
	// Условие пуска
	console.log(
		'\tАгрегат: Условие пуска',
		!alarm && pinV.value >= pin + hysteresisP,
		'!alarm',
		!alarm,
		'формула =',
		pinV,
		'>=',
		pin,
		hysteresisP
	)
	if (pinV.state === 'on' && !alarm && pinV.value >= pin + hysteresisP) acc[owner].run = true
	// Условие стоп:
	// Авария модулей
	// const alrM = isAlrM(agg, obj, acc)
	// Реле низкого давления
	const relay = acc?.[owner]?.relay
	console.log(
		'\tАгрегат: Условие стоп',
		'pinV.state=',
		pinV.state,
		'alr',
		alarm,
		'pinV <= pin',
		pinV.value <= pin,
		'relay',
		relay,
	)
	if (pinV.state !== 'on' || alarm || pinV.value <= pin || relay ) acc[owner].run = false
}

module.exports = { fnRunning }

// /**
//  * Модули ПЛК агрегата неисправны?
//  * @param {*} agg Рама агрегата
//  * @param {*} obj Глобальные данные
//  * @param {*} acc Аккумулятор
//  * @returns true Неисправны / false Модули ОК
//  */
// function isAlrM(agg, obj, acc) {
// 	console.log('\tАвария модулей агрегата')
// 	const arrM = new Set()
// 	// Найти модули, к которым подключен агрегат
// 	agg.compressorList.forEach((cmpr) => {
// 		cmpr.beep.forEach((beep) => {
// 			const sig = obj.data.signal.find(
// 				(el) => el.owner.id === beep._id && el.extra.id === agg._id
// 			)
// 			sig?.module?.id && sig?.module?.channel ? arrM.add(sig.module.id) : null
// 		})
// 	})
// 	console.log('\tАгрегат подключен к модулям:', arrM)
// 	// Модуль неисправен?
// 	return [...arrM].some((idM) => {
// 		const t = isErrM(agg.buildingId, idM)
// 		console.log(`\tМодуль ${idM}, авария=${t}`)
// 		return t
// 	})
// }
