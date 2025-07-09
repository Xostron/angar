const { data: store } = require('@store')
const { delExtralrm } = require('@tool/message/extralrm')

// Секция не в авто или выключен склад
function sectionOff(building, sect, obj, s, se, m, am, accAuto, resultFan, start, alrB) {
	if (!start || !obj.retain?.[building._id]?.mode?.[sect._id]) {
		// Сброс доп. аварий секции
		delExtralrm(building._id, sect._id, 'antibliz')
		delExtralrm(building._id, sect._id, 'overVlv')
		// Очистить задание вентиляторов
		store.aCmd ??= {}
		store.aCmd[sect._id] ??= {}
		store.aCmd[sect._id].fan = {}
		// TODO?
		// m.fanS.forEach((el) => {
		// 	store.watchdog ??= {}
		// 	store.watchdog[el._id] = {}
		// })
		// Очистка расчетов плавного пуска
		store.watchdog.softFan[sect._id] = {}
		// выключение испарителей
		// obj.data.fan.filter(el=>el)
		// fans.forEach((f, i) => {
		// f?.ao?.id ? ctrlAO(f, bld._id, 0) : null
		// ctrlDO(f, bld._id, 'off')
	// })
	}
}

module.exports = sectionOff
