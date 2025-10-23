const { arrCtrlDO } = require('@tool/command/module_output')
const { wrExtra, delExtra } = require('@tool/message/extra')
const { msg, msgB } = require('@tool/message')
const { isErrMs } = require('@tool/message/plc_module')

// Потеря связи с автоматикой (для склада Холодильник)
function connectLost(bld, sect, obj, s, se, m, alarm, acc, data, ban) {
	if (!m.connectLost?.length) return
	acc.flag ??= {}
	if (isErrMs(bld._id)) {
		// Есть неисправный модуль -> выключаем данные выхода
		arrCtrlDO(m.connectLost, bld._id, 'off')
		// Сообщение
		if (!acc.on) {
			acc.on = true
			wrExtra(bld._id, null, 'connectLost', msgB(bld, 101))
		}
		return
	}
	acc.on = false
	// Модули исправны -> Включаем данные выхода
	arrCtrlDO(m.connectLost, bld._id, 'on')
	// Удаляем сообщение
	delExtra(bld._id, null, 'connectLost')
}

module.exports = connectLost
