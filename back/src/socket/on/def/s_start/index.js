const retainStart = require('@tool/retain/start')

// Данные от web: вкл/выкл складов
module.exports = function sStart(io, socket) {
	socket.on('s_start', (obj, callback) => {
		// Создать или сохранить изменения в json
		if (obj.val === false) {
			obj.datestop = new Date()
			obj.datestart = null
		} else {
			obj.datestop = null
			obj.datestart = new Date()
		}
		retainStart(obj)
		console.log('s_start', obj)
	})
}
