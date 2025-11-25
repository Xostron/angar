const fanAu = require('@tool/command/fan/auto')
const { data: store, readAcc } = require('@store')
const { isCombiCold } = require('@tool/combi/is')

/**
 * Для секции
 * @param {*} bld
 * @param {*} bdata
 * @param {*} obj
 * @param {*} s
 * @param {*} seB
 * @param {*} m
 * @param {*} alr
 * @param {*} acc
 */
function fanCombi(bld, bdata, obj, s, seB, m, alr, acc) {
	// const resultFan = { start: [], list: [], fan: [], force:[] }
	const { resultFan } = bdata
	// Логика включения ВНО в комбинированном складе в режиме холодильник
	const start = checkStart(bld)
	resultFan.start.push(start)
	// resultFan.list.push(sect._id)
	// Последовательное вкл/выкл соленоида подогрева и ВНО секций
	const { sol, fan } = mFan(bld, m, bdata)
	resultFan.fan = [...sol, ...fan]
	fanAu.combi(bld, obj, s, seB, m, resultFan, bdata)
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

function mFan(bld, m, bdata) {
	const isCCFin = isCombiCold(bld, bdata?.automode, bdata?.s) && bdata.accAuto.cold?.flagFinish
	const r = { sol: [], fan: [] }

	// Комби склад в режиме холодильника + достиг температуры задания:
	// соленоиды и fanS - ВНО секции+ВНО испарителей
	if (isCCFin) {
		for (const idS in m.sect) {
			r.sol.push(...(m?.sect?.[idS]?.solHeatS ?? []))
			r.fan.push(...(m?.sect?.[idS]?.fanS ?? []))
		}
		return r
	}

	// Комби склад в режиме холодильника: соленоиды и ВНО секции
	for (const idS in m.sect) {
		r.sol.push(...(m?.sect?.[idS]?.solHeatS ?? []))
		r.fan.push(...(m?.sect?.[idS]?.fanSS ?? []))
	}
	return r
}

module.exports = fanCombi
