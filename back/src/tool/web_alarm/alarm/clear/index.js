const { data: store } = require('@store')

function normal(bld, r, data = {}) {
	const { am, start, sumAuto } = data
	// Авторежим не выбран, склад выключен,  нет секций в авто
	if (!am || !start || !sumAuto) {
		delete store.alarm.achieve?.[bld._id]
		// r.achieve ??= {}
		// r.achieve[bld._id] = {}
		// r.timer ??= {}
		// r.timer[bld._id] = {}
	}
}

function cold(bld, r, data = {}) {
	const { start } = data
	if (!start) {
		delete store.alarm.achieve?.[bld._id]
		// r.achieve ??= {}
		// r.achieve[bld._id] = {}
	}
}

function combi(bld, r) {}

module.exports = { normal, cold, combi }
