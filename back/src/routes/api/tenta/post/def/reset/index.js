const { data: store, reset } = require("@store")

function cmd(obj) {
	return new Promise((resolve, reject) => {
		// Вкл сброс аварий
		reset(obj)
		// Очистка аккумулятора аварий
		// store.alarm.auto[obj.buildingId] = {}
		// store.alarm.extralrm[obj.buildingId] = {}
		resolve(true)
	})
}

/*
{"buildingId":"65d4aed4b47bb93c40100fd5"}
*/

module.exports = cmd
