const { compareTime } = require('@tool/time')
const { store } = require('@store/index')

// Авария нет связи с ангаром - отключение всех выходов
// true - нет связи между ангаром и микросервисом
function live() {
	store.extralrm.live = compareTime(store.timestamp, store._TIME_IO)
}

module.exports = live
