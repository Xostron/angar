const { readAcc } = require('@store/index')
const { data: store } = require('@store')

function sp(bldId, type, automode) {
	const t = type === 'normal' ? (automode ?? type) : type
	const acc = readAcc(bldId, t)

	if (type === 'cold') {
		const r = { tprd: acc.target }
		// console.log(9999, r)
		return r
	}
	const r = {
		tprd: acc.tgt,
		tcnl: acc.tcnl,
		p: store.calcSetting?.[bldId]?.fan?.pressure?.p,
		hin: acc.setting?.mois?.humidity,
	}
	// console.log(999, r)
	return r
}

module.exports = sp
