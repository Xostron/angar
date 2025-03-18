const { data: store, reset } = require("@store")

// Обнулить дни сушки
function cmd(obj) {
	return new Promise((resolve, reject) => {
		store.zero = true
		resolve(true)
	})
}

/*
{"buildingId":"65d4aed4b47bb93c40100fd5"}
*/

module.exports = cmd
