const { compareTime } = require('@tool/time')
const { store } = require('@store/index')

// Авария нет связи с ангаром - отключение всех выходов
function live() {
	store.extralrm.live = compareTime(store.timestamp, store._TIME_IO)
}

module.exports = live
