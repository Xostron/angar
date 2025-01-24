const { data: store } = require('@store')
const { cAlarm } = require('@socket/emit')
const alarm = require('./alarm')

// Обработка авари для отправки клиенту
async function webAlarm(obj) {
	const r = alarm(obj)
	// Сохранение данных в store
	store.value = { ...obj.value, retain:obj.retain, factory:obj.factory, alarm: r }
	// console.log(2222, store.alarm)
	// console.log(3333, obj.acc)
	// Socket: Передача на клиент ангара
	await cAlarm(r)

	return r
}

module.exports = webAlarm
