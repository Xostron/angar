const { msgV } = require('@tool/message')
const { getSignal } = require('@tool/command/signal')
const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')

// Нет питания электродвигателя клапана
function vlvCrash(building, section, obj, s, se, m, automode, acc, data) {
	// console.log(m)

	for (const v of m.vlvS) {
		acc[v._id] ??= {}
		const sig = getSignal(v?._id, obj, 'vlvCrash')

		const typeV = v.type === 'in' ? 'Приточный' : 'Выпускной'

		// Сброс
		if (!sig) {
			delExtralrm(building._id, section._id, 'vlvCrash' + v._id)
			acc[v._id]._alarm = false
		}
		// Установка
		if (sig && !acc[v._id]._alarm) {
			wrExtralrm(
				building._id,
				section._id,
				'vlvCrash' + v._id,
				msgV(building, section, typeV, 34)
			)
			acc[v._id]._alarm = true
		}
	}
}

module.exports = vlvCrash
