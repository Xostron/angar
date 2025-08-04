const fan = require('@tool/command/fan/auto')
const { data: store, readAcc } = require('@store')

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
	const start = checkStart(bld)
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
function checkStart(bld) {
	// Достиг задания И нет удаления СО2  => выкл ВНО
	if (store.alarm.achieve?.[bld._id]?.cooling?.finish) return false
	// По-умолчанию вкл
	return true
}

module.exports = fanCombi
