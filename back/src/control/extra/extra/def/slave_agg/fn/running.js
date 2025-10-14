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
	// Авария питания, перегрев двигателя, ?
	const { supply, int, pressure } = stateAgg.compressor[cmpr._id].beep
	const alr = supply?.value || int?.value || pressure?.value || acc[owner]?.oil
	// Условие пуска
	console.log('\tАгрегат: Условие пуска', !alr && pinV >= pin + hysteresisP)
	if (!alr && pinV >= pin + hysteresisP) acc[owner].run = true
	// Условие стоп
	const alrM = isAlrM(agg, obj, acc)
	console.log('\tАгрегат: Условие стоп', alr, pinV <= pin, alrM)
	if (alr || pinV <= pin || alrM) acc[owner].run = false
}

module.exports = { fnRunning }

/**
 * Модули ПЛК агрегата неисправны?
 * @param {*} agg Рама агрегата
 * @param {*} obj Глобальные данные
 * @param {*} acc Аккумулятор
 * @returns true Неисправны / false Модули ОК
 */
function isAlrM(agg, obj, acc) {
	console.log('\tАвария модулей агрегата')
	const arrM = []
	// Найти модули, к которым подключен агрегат
	agg.compressorList.forEach((cmpr) => {
		cmpr.beep.forEach((beep) => {
			const sig = obj.data.signal.find(
				(el) => el.owner.id === beep._id && el.extra.id === agg._id
			)
			// console.log(331, beep.name, sig?.module?.channel)
			sig?.module?.id && sig?.module?.channel ? arrM.push(sig.module.id) : null
		})
	})
	console.log('\tАгрегат подключен к модулям:', arrM)
	// Модуль неисправен?
	return arrM.some((idM) => {
		const t = isErrM(agg.buildingId, idM)
		console.log(`\tМодуль ${idM}, авария=${t}`)
		return t
	})
}
