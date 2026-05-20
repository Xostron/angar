const { data: store } = require('@store')

// Данные от web: Прогрев секции
module.exports = function sMode(io, socket) {
	socket.on('s_warming', (obj, callback) => {
		// склад, секция, команда (true-вкл, false-выкл)
		const { buildingId, sectionId, cmd } = obj
		store.warming ??= {}
		store.warming[buildingId] ??= {}
		store.warming[buildingId][sectionId] = cmd
		console.log('s_warming', obj)
	})
}
