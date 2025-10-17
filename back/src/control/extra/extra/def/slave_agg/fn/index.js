const { fnAlarm } = require('./alarm')
const { fnRunning } = require('./running')
const { ctrlDO } = require('@tool/command/module_output')

/**
 * Логика управления агрегатом
 * @param {*} agg Рама агрегата aggregateList
 * @param {*} stateAgg Мясо агрегата
 * @param {*} pin Значение давления всасывания
 * @param {*} bld Склад
 * @param {*} obj Глобальные данные алгоритма
 * @param {*} s Настройки
 */
module.exports = function fnAgg(agg, stateAgg, pin, bld, obj, s, acc) {
	if (!agg.compressorList.length) return
	for (const cmpr of agg.compressorList) {
		console.log(222, agg.name, agg._id, 'Состояние:', stateAgg.state)
		// Если ниодного сигнала на компрессор нету, то пропускаем
		if (!Object.keys(stateAgg.compressor[cmpr._id].beep).length) continue
		// Если авария датчика всасывания, то пропускаем
		// if (pin.state === 'alarm') continue
		const owner = agg._id + '_' + cmpr._id
		acc[owner] ??= {}
		// Условие пуска
		fnRunning(agg, bld, owner, cmpr, stateAgg, acc, pin, obj, s)
		// Наличие аварий и создание сообщений
		fnAlarm(agg, owner, cmpr, cmpr.beep, stateAgg.compressor[cmpr._id].beep, acc)
		// Пуск-Стоп
		let DO = cmpr.beep.find((el) => el.code === 'run')
		DO = obj.data.signal.find((el) => el.owner.id === DO?._id && el.extra.id === agg._id)
		ctrlDO(DO, agg.buildingId, acc[owner].run ? 'on' : 'off')
		console.log('\tАккумулятор', agg.name)
		console.table(acc)
	}
}
