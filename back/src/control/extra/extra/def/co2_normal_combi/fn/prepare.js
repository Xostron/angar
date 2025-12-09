const { isAlr } = require('@tool/message/auto')
const { readAcc } = require('@store/index')
const { isCombiCold } = require('@tool/combi/is')
const { getIdsS } = require('@tool/get/building')

module.exports = function fnPrepare(bld, obj, s, m) {
	// Авторежим склада
	const am = obj.retain?.[bld._id]?.automode
	// Авария авторежима
	const alrAuto = isAlr(bld._id, am)
	// Комби склад в режиме холодильника
	const isCC = isCombiCold(bld, am, s)
	// Комби склад в режиме обычного
	const isCN = !isCC
	// Обычный склад
	const isN = bld.type === 'normal'
	// Склад включен
	const start = obj.retain[bld._id].start
	// Комби-холодильника: Достиг задания
	const ccFlagFinish = readAcc(bld._id, 'combi')?.cold?.flagFinish
	// Обычный, Комби-обычный: Достиг задания
	const flagFinish = def[bld.type](bld._id, am, isCN)
	// Массив секций
	let idsS = getIdsS(obj.data.section, bld._id)
	// Массив секций в авто
	idsS = idsS.filter((idS) => obj.retain[bld._id].mode?.[idS])
	// Все ли клапаны закрыты (секции в авто)
	let vlvClosed
	idsS.forEach((idS) => {
		vlvClosed = obj.data.valve.filter((el) => el.sectionId.includes(idS))
	})
	vlvClosed = vlvClosed?.every((el) => obj.value[el._id].state === 'cls')
	// Точка росы
	const point = obj.value.total?.[bld._id]?.point
	// Температура продукта
	const tprd = obj.value.total?.[bld._id]?.tprd?.min
	// Показание со2
	const co2 = obj.value.total?.[bld._id]?.co2?.max
	// Относительная влажность улицы
	const hout = obj.value.total?.hout?.max
	// Макс. внешняя отн. влажность
	let outMax
	if (am === 'drying') {
		// Сушка
		outMax = s?.drying?.humidityMax
	} else if (am === 'cooling') {
		// Хранение
		outMax = s?.mois?.outMax
	}
	// Если данные невалидны (valid=false), то запрет выполнение СО2
	let validSe = !isNaN(point) && !isNaN(tprd) && !isNaN(hout) && !isNaN(outMax)
	// для режима по датчику
	validSe = s.co2.mode === 'sensor' ? validSe && !isNaN(co2) : validSe

	return {
		am,
		alrAuto,
		isCC,
		isCN,
		isN,
		start,
		ccFlagFinish,
		flagFinish,
		idsS,
		vlvClosed,
		point,
		tprd,
		co2,
		hout,
		outMax,
		validSe,
	}
}
