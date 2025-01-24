const { getSignal } = require('@tool/command/signal')
const { data: store, wrExtralrm, delExtralrm, isReset } = require('@store')
const { msgV } = require('@tool/message')
const mes = require('@dict/message')

// Нет питания электродвигателя клапана
function vlvCrash(building, section, obj, s, se, m, automode, acc, data) {
	// console.log(m)

	for (const v of m.vlvS) {
		acc[v._id] ??= {}
		const sig = getSignal(v?._id, obj, 'vlvCrash')

		const typeV = v.type === 'in' ? 'Приточный' : 'Выпускной'
		// Сброс
		if (!sig || isReset(building._id)) {
			delExtralrm(building._id, section._id, 'vlvCrash' + v._id)
			acc[v._id].alarm = false
		}
		// Установка
		if (sig && !acc[v._id].alarm) {
			wrExtralrm(building._id, section._id, 'vlvCrash' + v._id, {
				date: new Date(),
				...msgV(building, section, typeV, 34),
			})
			acc[v._id].alarm = true
		}
	}

}

module.exports = vlvCrash
