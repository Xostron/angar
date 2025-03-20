// Комбинированный склад
function combi(building, obj, bdata) {
	if (building?.type !== 'combi') return
	const { start, automode, s, se, m, accAuto, resultFan } = bdata
	console.log(111, 'Комбинированный холодильный склад', building._id)
	// console.log(se)
}

module.exports = combi