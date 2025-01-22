const { getSignal } = require('@tool/command/signal')
const { data: store, wrExtralrm, delExtralrm, isReset } = require('@store')
const { msgV } = require('@tool/message')
const { writeAcc, removeAcc } = require('@tool/acc_json')

// Нет питания электродвигателя клапана
function vlvCrash(building, section, obj, s, se, m, automode, acc, data) {
	// console.log(m)

	for (const v of m.vlvS) {
		acc[v._id] ??= {}
		const sig = getSignal(v?._id, obj, 'vlvCrash')
		const o = { bldId: building._id, secId: section._id, code: 'vlvCrash' + v._id }
		const typeV = v.type === 'in' ? 'Приточный' : 'Выпускной'

		// Сброс
		if (!sig || isReset(building._id)) {
			delExtralrm(building._id, section._id, 'vlvCrash' + v._id)
			removeAcc(obj.acc, o, 'extralrm')
			acc[v._id].alarm = false
		}
		
		// Установка
		if (sig && !acc[v._id].alarm) {
			const mes = { date: new Date(), ...msgV(building, section, typeV, 34) }
			wrExtralrm(building._id, section._id, 'vlvCrash' + v._id, mes)
			writeAcc(obj.acc, { ...o, mes }, 'extralrm')
			acc[v._id].alarm = true
		}
	}
}

module.exports = vlvCrash
