const alarm = require('./alarm')
const { submode, target, message } = require('./middlew')
const { data: store, readAcc } = require('@store')
const sm = require('@dict/submode')

// Автоматический режим: Охлаждение
const data = {
	// Аварии режима
	alarm,
	// Логика включения клапанов
	valve,
	// Логика включения вентиляторов
	fan,
	// Данные от охлаждения на Доп. аварии (Антивьюга, работа клапанов и т.д.)
	toAlrS: (s, sectionId, acc) => ({ exclude: '' }),
	// Данные от охлаждения на Доп. функции (контроль вентиляции, обогрев клапанов и т.д.)
	toExtra: (s, alarm) => ({ fanOff: alarm, alwaysFan: null }),
	// Промежуточные расчеты по секции (если такие возникнут)
	middlew: (building, section, obj, s, se, seB, alr, acc) => {},
	// Промежуточные расчеты по складу
	middlewB,
}

function middlewB(building, obj, s, seB, am, acc, alrBld) {
	const { tout, hout, hAbsOut, hAbsIn, tprd, tcnl } = seB
	// Вычисление подрежима
	submode(building, obj, s, seB, acc)
	// Вычисления
	target(building, obj, s, seB, acc, alrBld)
	// Сообщения
	message(building, obj, s, seB, am, acc)
}

function valve(idS, obj, m, s, se, acc, isCO2work) {
	const open = se.tcnl > acc.tcnl + acc?.setting?.cooling?.hysteresisIn ?? 0.3
	const close = se.tcnl < acc.tcnl - acc?.setting?.cooling?.hysteresisIn ?? 0.3
	const forceCls = acc.finish && !isCO2work
	const forceOpn = heatOpen(idS, obj, m, acc)
	// console.log('\tКлапаны, режим хранение, секция', acc)
	console.table([{ open, close, forceCls, forceOpn }], ['open', 'close', 'forceCls', 'forceOpn'])
	return { open, close, forceCls, forceOpn }
}

function fan(s, se, alr, idS, acc) {
	// Условие пуска ВНО: нет аварии И {задание продукта не достигнуто ИЛИ удаление СО2}
	const alright = !acc.finish
	const start = !alr && alright
	// console.log(8801, start, '=', !alr, alright)
	return { start }
}

module.exports = data

/**
 * Контроль принудительного открытия приточных
 * клапанов секции в подрежиме нагрева
 * @param {*} obj Глобальный объект по состоянию склада
 * @param {*} m Рама секции
 * @param {*} acc Аккумулятор авторежима
 * @returns {boolean} true - вкл принудительное открытие
 */
function heatOpen(idS, obj, m, acc) {
	acc.firstHeat ??= {}
	// Подрежим не нагрев, выходим
	if (acc?.submode?.[0] !== sm.heat[0]) {
		delete acc?.firstHeat?.[idS]
		return false
	}
	// Флаг для принудительного открытия клапанов при включении режима нагрев
	acc.firstHeat[idS] ??= true
	// Ждем у всех приточных клапанов секции состояния "открыто"
	const isOpn = m.vlvS
		.filter((el) => el.type === 'in' && obj.value[el._id].state !== 'alr')
		.some((el) => obj.value[el._id].state === 'opn')

	if (!isOpn && acc?.firstHeat?.[idS]) {
		return true
	}
	acc.firstHeat[idS] = false
	return false
}
