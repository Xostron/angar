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
		console.log(111, 'Агрегат', agg.name, agg._id, stateAgg.compressor[cmpr._id].beep)
		if (!Object.keys(stateAgg.compressor[cmpr._id].beep).length) continue
		if (pin.state == 'alarm') continue
		const owner = agg._id + '_' + cmpr._id
		acc[owner] ??= {}
		// Условие пуска
		fnRunning(bld, owner, cmpr, stateAgg, acc, pin.value, s)
		// Наличие аварий и создание сообщений
		fnAlarm(agg, owner, cmpr, cmpr.beep, stateAgg.compressor[cmpr._id].beep, acc)
		// Пуск-Стоп
		let DO = cmpr.beep.find((el) => el.code == 'run')
		DO = obj.data.signal.find((el) => el.owner.id == DO?._id)
		ctrlDO(DO, agg.buildingId, acc[owner].running ? 'on' : 'off')

		console.log(444, agg.name, stateAgg, acc)
	}
}
