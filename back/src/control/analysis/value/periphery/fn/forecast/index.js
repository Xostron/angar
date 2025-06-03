module.exports = function forecast(equip, result, retain) {
	const { weather, building } = equip
	result.advice ??= []
	building.forEach(bld=>{
		const tprd = result.total[bld._id].tprd.min

	})
	// console.log(result.total)
}
