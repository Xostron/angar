// Список неисправностей в реальном времени
function monitoring(alr) {
	let r = []
	for (const bld in alr) r = r.concat(...alr[bld].filter((el) => el.count))
	return r
}

module.exports = monitoring
