function normal(bld, r, data = {}) {
	const { am, start, sumAuto } = data
	// Авторежим не выбран, склад выключен,  нет секций в авто
	if (!am || !start || !sumAuto) {
		r.achieve ??= {}
		r.achieve[bld._id] = {}
		r.timer ??= {}
		r.timer[bld._id] = {}
	}
}

function cold(bld, r, data = {}) {
	const { start } = data
	if (!start) {
		r.achieve ??= {}
		r.achieve[bld._id] = {}
	}
}

function combi(bld, r) {}

module.exports = { normal, cold, combi }
