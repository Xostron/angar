const { stateEq } = require('@tool/command/fan/fn')
const { curStateV } = require('@tool/command/valve')
const { msg } = require('@tool/message')
const { delExtra, wrExtra } = require('@tool/message/extra')
const { compareTime } = require('@tool/command/time')

// Режим вентиляции: Вкл - принудительное включение
function fnOn(s, sect, resultFan) {
	if (resultFan) resultFan.force = true
}

module.exports = fnOn
