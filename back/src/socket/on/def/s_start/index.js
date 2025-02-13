const retainStart = require('@tool/retain/start')

const activityLog = require('@root/stat/activity')

// Данные от web: вкл/выкл складов
module.exports = function sStart(io, socket) {
	socket.on('s_start', (obj, callback) => {
		// Создать или сохранить изменения в json
		retainStart(obj)
		console.log('s_start', obj)
		// Логирование
		// const message = { bldId: obj._id, value: obj.val, title: obj.val ? mes[500].msg : mes[501].msg }
		// loggerEvent['activity']({ message })
		activityLog('s_start', obj)
	})
}
