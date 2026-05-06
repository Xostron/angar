const { readAcc } = require('@store/index')
const { data: store } = require('@store')

function sp(bldId, type, automode) {
	const t = type === 'normal' ? (automode ?? type) : type
	const acc = readAcc(bldId, t)

	if (type === 'cold') {
		const r = { tprd: acc.target }
		console.log(9999, r)
		return r
	}

	if (type === 'combi') {
		const r = {
			tprd:
				isNaN(acc?.cold?.tgtTprd) || acc?.cold?.tgtTprd === null
					? acc?.cold?.tgtTprd
					: +acc?.cold?.tgtTprd?.toFixed(1),
			tcnl:
				isNaN(acc?.cold?.tgtTcnl) || acc?.cold?.tgtTcnl === null
					? acc?.cold?.tgtTcnl
					: +acc?.cold?.tgtTcnl?.toFixed(1),
			p: store.calcSetting?.[bldId]?.fan?.pressure?.p,
			hin: acc.setting?.mois?.humidity,
		}
		console.log(999, r)
		return r
	}
	const r = {
		tprd: isNaN(acc.tgt) ? acc.tgt : +acc.tgt.toFixed(1),
		tcnl: isNaN(acc.tcnl) ? acc.tcnl : +acc.tcnl.toFixed(1),
		p: store.calcSetting?.[bldId]?.fan?.pressure?.p,
		hin: acc.setting?.mois?.humidity,
	}
	console.log(99, r)
	return r
}

module.exports = sp
