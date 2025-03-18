const { data: store, zero } = require("@store")

// Обнулить дни сушки
function cmd(obj) {
	return new Promise((resolve, reject) => {
		zero(obj)
		resolve(true)
	})
}

/*
{"buildingId":"65d4aed4b47bb93c40100fd5"}
*/

module.exports = cmd
