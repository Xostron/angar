const { msgV } = require('@tool/message')
const { getSignal } = require('@tool/command/signal')
const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')

// Нет питания электродвигателя клапана
function vlvCrash(building, section, obj, s, se, m, automode, acc, data) {
	// console.log(5500, m.vlvAll)
	const arrIn = m.vlvAll.filter((el) => el.type === 'in')

	for (const v of m.vlvAll) {
		acc[v._id] ??= {}
		const sig = getSignal(v?._id, obj, 'vlvCrash')

		const typeV = v.type === 'in' ? 'Приточный' : 'Выпускной'

		// Сброс
		if (!sig) {
			delExtralrm(building._id, 'vlvCrash', v._id)
			acc[v._id]._alarm = false
		}
		// Установка
		if (sig && !acc[v._id]._alarm) {
			wrExtralrm(building._id, 'vlvCrash', v._id, msgV(building, section, typeV, 34))
			acc[v._id]._alarm = true
		}
	}
	// Если авария приточного клапана, то выключаем весь склад
	const alr = arrIn.some((el) => acc?.[el._id]?._alarm)
	// console.log(55001, alr)
	return alr
}

module.exports = vlvCrash
