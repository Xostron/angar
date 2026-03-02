const { delExtra, wrExtra, isExtra } = require('@tool/message/extra')
const { ctrlDO } = require('@tool/command/module_output')
const { msgB } = require('@tool/message')
const { data: store } = require('@store')
// Выключение
function fnAlarm(building, arr, value) {
	arr?.forEach((el) => {
		if (value?.[el._id]?.state === 'alarm') return ctrlDO(el, building._id, 'off')
	})
}

// Обновление событий при смене режима (очищает лишние сообщения)
function delUnused(arrCode, code, bld, codeMsg, type) {
	arrCode.forEach((el) => {
		if (el !== code) {
			delExtra(bld._id, null, type, el)
			return
		}
		wrExtra(bld._id, null, type, msgB(bld, codeMsg), el)
	})
}

module.exports = { fnAlarm, delUnused }
