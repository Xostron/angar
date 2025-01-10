// Список неисправностей в реальном времени
function monitoring(alr) {
	let r = []
	for (const key in alr) r = r.concat(...alr[key].filter((el) => el.count))
		console.log(r)
	return r
}

module.exports = monitoring
