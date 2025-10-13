const { compareTime, onTime } = require('@tool/command/time')
const check = require('../../../check')

// Обдув
function blow(fnChange, acc, se, s, bld, clr) {
	onTime('blow', acc)
	// Отсутсвует время включения обдува
	if (!acc.state.blow) {
		console.log('\tblow', 'Отсутсвует время включения обдува')
		// переход на набор холода
		return check.combi(fnChange, 'blow', acc, se, s, bld, clr)
	}

	const off = acc.state.off ?? 0
	const bf = Math.max(acc.state.frost ?? 0, acc.state.cooling ?? 0)
	// Время обдува (после остановки)
	// TODO Комбинированный - возможно убрать обдув после остановки?
	if (off > bf) {
		// Время обдува не закончилось
		const time = compareTime(acc.state.blow, s.coolerCombi?.blow)
		console.log('\tblow', 'Время обдува (после остановки)', time)
		if (!time) return
	}
	// console.log(666, )
	return check.combi(fnChange, 'blow', acc, se, s, bld, clr)
}
module.exports = blow
