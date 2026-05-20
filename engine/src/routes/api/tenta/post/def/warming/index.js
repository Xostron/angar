const { data: store } = require("@store")

function cmd(obj) {
	return new Promise((resolve, reject) => {
		const { buildingId, sectionId, value } = obj
		store.warming ??= {}
		store.warming[buildingId] ??= {}
		store.warming[buildingId][sectionId] = value
		resolve(true)
	})
}

/*
{"buildingId":"65d4aed4b47bb93c40100fd5","sectionId":"65d4aee3b47bb93c40100fd6","cmd":true}
*/

module.exports = cmd
