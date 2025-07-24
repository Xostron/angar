const defrostAll = require('@tool/combi/defrost_drain')
const { clearBuild } = require('../../fn/denied/fn')
const { sensor } = require('@tool/command/sensor')
const { oneChange } = require('../../fn/change')
const { mech } = require('@tool/command/mech')
const target = require('../../fn/tgt')
const coolers = require('./coolers')
const fan = require('@tool/command/fan/auto')
const denied = require('../../fn/denied')
const { data: store } = require('@store')

// Комбинированный - холодильник
function main(bld, obj, bdata, alr) {
	const { data } = obj
	const { start, automode, s, se, m, accAuto } = bdata
	// Управление испарителем
	const fnChange = (sl, f, h, add, code, clr) =>
		oneChange(bdata, bld._id, sl, f, h, add, code, clr)

	// Синхронизация оттайки-слива_воды испарителей
	defrostAll(accAuto.cold, m.cold.cooler, obj)

	// По камере
	for (sect of data.section) {
		if (sect.buildingId != bld._id) continue
		// Исполнительные механизмы камеры
		const mS = mech(obj, sect._id, sect.buildingId)
		// Показания с датчиков секции
		const seS = sensor(bld._id, sect._id, obj)
		// Работа испарителей
		coolers(bld, sect, bdata, seS, mS, alr, fnChange, obj)
		if (denied.section(bld, sect, bdata, alr, obj)) continue
		// Работа ВНО секции и TODO соленоида подогрева (регулирование температурой канала)
		fanCombi(bld, sect, bdata, obj, s, se, seS, m, mS, alr, accAuto.cold)
	}
	if (clearBuild(bld, bdata.accAuto)) {
		// Работа склада разрешена -> Вычисление Т target
		// console.log(999)
		target.combi(bld, obj, bdata, alr)
	}
}

module.exports = main

/**
 * Для секции
 * @param {*} bld
 * @param {*} sect
 * @param {*} bdata
 * @param {*} obj
 * @param {*} s
 * @param {*} seB
 * @param {*} seS
 * @param {*} m
 * @param {*} mS
 * @param {*} alr
 * @param {*} acc
 */
function fanCombi(bld, sect, bdata, obj, s, seB, seS, m, mS, alr, acc) {
	const resultFan = { start: [], list: [], fan: [] }
	// Логика включения ВНО в комбинированном складе в режиме холодильник
	const start = checkStart(bld, sect, s, seS, acc)
	resultFan.start.push(start)
	resultFan.list.push(sect._id)
	// Последовательное вкл/выкл соленоида подогрева и ВНО
	resultFan.fan.push(...mS.solHeatS, ...mS.fanSS)
	// console.log(994, resultFan)
	fan.combi(bld, obj, s, seB, seS, m, resultFan, bdata)
}

/**
 * 1) если температура канала выше задания, то продолжаем работать только испарителями
 * 2) температура канала в пределах температуры канала +- гистерезис, продолжаем
 * 		работать только испарителями
 * 3) температура канала ниже задания канала - гистерезис, начинаем подключать
 * 		ВНО начиная с того у кого частотник, если температура канала начинает рости
 * 		уменьшаем работу ВНО
 * 4) если температура канала ниже задания канала - гистерезис и все ВНО работают
 * 		на 100%, то (я пока что не знаю как узнаю сообщу тебе)
 * @returns {boolean} true - вкл ВНО, false - выкл ВНО
 */
function checkStart(bld, sect, s, seS, acc) {
	// Достиг задания => выкл ВНО
	if (store.alarm.achieve?.[bld._id]?.cooling?.finish) return false
	return true
}
