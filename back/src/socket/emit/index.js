const { io } = require('@tool/server')

// Широковещательные сообщения (всем клиентам)
// значения сигналов
function cValue(data) {
	io.volatile.emit('c_input', data)
}

// склады и оборудование
function cEquip(data) {
	io.emit('c_equip', data)
}

// Аварии
function cAlarm(data) {
	io.emit('c_alarm', data)
}

// Прогрев секции закончен
function cWarm(data) {
	io.emit('c_warm', data)
}

module.exports = { cValue, cEquip, cAlarm, cWarm }
