const { data: store, delExtralrm } = require('@store')
const { mech } = require('@tool/command/mech')

// Секция не в авто или выключен склад
function sectionOff(building, sect, obj, s, se, m, am, accAuto, resultFan, start, alrB) {
	if (!start || !obj.retain?.[building._id]?.mode?.[sect._id]) {
		// Сброс доп. аварий секции
		delExtralrm(building._id, sect._id, 'antibliz')
		delExtralrm(building._id, sect._id, 'over_vlv')
		// Очистить задание вентиляторов
		store.aCmd ??= {}
		store.aCmd[sect._id] ??= {}
		store.aCmd[sect._id].fan = {}
		m.fanS.forEach((el) => {
			store.watchdog ??= {}
			store.watchdog[el._id] = {}
		})
	}
}

module.exports = sectionOff
