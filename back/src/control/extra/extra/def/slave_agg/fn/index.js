const { fnAlarm } = require('./alarm')
const { fnRunning } = require('./running')
const { ctrlDO } = require('@tool/command/module_output')

/**
 * Логика управления агрегатом
 * @param {*} agg Рама агрегата
 * @param {*} stateAgg Мясо агрегата
 * @param {*} pin Значение давления всасывания
 * @param {*} bld Склад
 * @param {*} obj Глобальные данные алгоритма
 * @param {*} s Настройки
 */
module.exports = function fnAgg(agg, stateAgg, pin, bld, obj, s, acc) {
	if (!agg.compressorList.length) return
	for (const cmpr of agg.compressorList) {
		if (!Object.keys(stateAgg.compressor[cmpr._id].beep).length) continue
		if (pin.state == 'alarm') continue
		acc[cmpr._id] ??= {}
		// Условие пуска
		fnRunning(bld, cmpr, stateAgg, acc, pin.value, s)
		// Наличие аварий и создание сообщений
		fnAlarm(agg, cmpr, cmpr.beep, stateAgg.compressor[cmpr._id].beep, acc)
		// Пуск-Стоп
		let DO = cmpr.beep.find((el) => el.code == 'run')
		DO = obj.data.signal.find(el=>el.owner.id==DO?._id)
		ctrlDO(DO, agg.buildingId, acc[cmpr._id].running ? 'on':'off')

		console.log(99009, 'работаем епта', stateAgg, acc)
	}
}
