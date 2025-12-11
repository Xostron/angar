const { isAlr } = require('@tool/message/auto')
const { readAcc } = require('@store/index')
const { isCombiCold } = require('@tool/combi/is')
const { getIdsS } = require('@tool/get/building')
const { def } = require('@tool/command/fan/duration/prepare')

function fnPrepare(bld, obj, s, m) {
	// Массив секций
	let idsS = getIdsS(obj.data.section, bld._id)
	// Массив секций в авто
	idsS = idsS.filter((idS) => obj.retain[bld._id].mode?.[idS])
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
	// Все ли клапаны закрыты (секции в авто)
	let vlvClosed
	idsS.forEach((idS) => {
		vlvClosed = obj.data.valve.filter((el) => el.sectionId.includes(idS))
	})
	vlvClosed = vlvClosed?.every((el) => obj.value[el._id].state === 'cls')
	// Рабочие ВНО по всем секциям в авто
	const fan = idsS.flatMap((idS) => m.sect[idS]?.fanS ?? [])
	// Точка росы
	const point = obj.value.total?.[bld._id]?.point
	// Температура продукта
	const tprd = obj.value.total?.[bld._id]?.tprd?.min
	// Показание со2
	const co2 = obj.value.total?.[bld._id]?.co2?.max
	// Относительная влажность улицы
	const hout = obj.value.total?.hout?.max
	// Макс. внешняя отн. влажность
	const isHout = fnIsHout(hout, s, am)
	// Температура улицы
	const tout = obj.value.total?.tout?.min
	// Если данные невалидны (valid=false), то запрет выполнение СО2
	// Для режима таймер / датчик
	let validSe = !isNaN(point) && !isNaN(tprd) && !isNaN(hout) && !isNaN(tout)
	validSe = s.co2.mode === 'time' ? validSe : validSe && !isNaN(co2)

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
		fan,
		point,
		tprd,
		co2,
		hout,
		tout,
		isHout,
		validSe,
	}
}

module.exports = fnPrepare

/**
 * Учитывать внешнюю относительную влажность
 * @param {*} hout Влажность улицы
 * @param {*} s Настройки
 * @param {*} am авторежим: drying, cooling
 * @return {boolean} true - предупреждение влажность улицы выше допустимой,
 * false - влажность подходит/слежение в настройках выключена
 */
function fnIsHout(hout, s, am = 'cooling') {
	// Максимальная внешн. отн. влажность: настройки Сушка или Влажность
	const t = am === 'drying' ? am : 'mois'
	// Название поля
	const f = t === 'drying' ? 'humidityMax' : 'outMax'
	return s?.co2?.hout ? hout >= s?.[t]?.[f] : false
}
