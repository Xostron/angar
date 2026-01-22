const { msgV, msgB, msgClr } = require('@tool/message')
const { getSignal, getSig } = require('@tool/command/signal')
const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')

/**
 * Автомат. выключатель выключен оттайки испарителя
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
function heatingClrCrash(building, section, obj, s, se, m, automode, acc, data) {
	// const arrQF = m.heatingClrAll.map((h) => obj.data.signal.find((si) => si.owner.id === h._id))

	console.log(6600, m.heatingClrAll)
	// по оттайкам испарителей
	for (const el of m.heatingClrAll) {
		// Рама сигнала
		const sigR = getSig(el._id, obj, 'defrost')
		// Значение сигнала
		const sig = getSignal(el._id, obj, 'defrost')
		// null - сигнал не найден/не существует
		if (sig === null) continue
		console.log('\t', sig, sigR._id)

		// Сброс
		if (!sig) delExtralrm(building._id, 'heatingClrCrash', sigR._id)
		// Установка
		if (sig) wrExtralrm(building._id, 'heatingClrCrash', sigR._id, msgClr(building, obj.data.cooler, el.owner.id, 34))
	}
}

module.exports = heatingClrCrash
