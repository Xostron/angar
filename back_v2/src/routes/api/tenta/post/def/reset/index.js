const { reset } = require('@tool/reset')

function cmd(obj) {
	return new Promise((resolve, reject) => {
		// Вкл сброс аварий
		reset(obj)
		resolve(true)
	})
}

/*
{"buildingId":"65d4aed4b47bb93c40100fd5"}
*/

module.exports = cmd
