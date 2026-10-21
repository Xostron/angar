const { msgClr } = require('@tool/message')
const { getSignal, getSig } = require('@tool/command/signal')
const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')

/**
 * Испаритель X. Заслонка X. Выключен автомат питания
 * @param {*} building
 * @param {*} section
 * @param {*} obj
 * @param {*} s
 * @param {*} se
 * @param {*} m
 * @param {*} automode
 * @param {*} acc
 * @param {*} data
 * @returns
 */
function fCoolerCrash(building, section, obj, s, se, m, automode, acc, data) {
	// по оттайкам испарителей
	for (const el of m.flapClrAll) {
		// Состояние заслонки и его сигналов
		// const flap = obj.value?.[el.owner.id]?.flap?.[el._id]
		// console.log(22, flap)
		// Рама сигнала
		const h = getSig(el._id, obj, 'crash')
		// Значение сигнала
		const v = getSignal(el._id, obj, 'crash')
		// null - сигнал не найден/не существует
		if (v === null) continue

		// Сброс
		if (!v) delExtralrm(building._id, 'fCoolerCrash', h._id)
		// Установка
		if (v)
			wrExtralrm(
				building._id,
				'fCoolerCrash',
				h._id,
				msgClr(building, obj.data.cooler, el.owner.id, 105),
				[h?.module?.id],
			)
	}
}

module.exports = fCoolerCrash
