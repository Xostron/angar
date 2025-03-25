const {delExtra, wrExtra} = require('@tool/message/extra')
const { ctrlB } = require('@tool/command/fan')
const { msgB } = require('@tool/message')

// Выключение
function fnAlarm(building, arr, value) {
	arr?.forEach((el) => {
		if (value?.[el._id]?.state === 'alarm') return ctrlB(el, building._id, 'off')
	})
}

// Формирование событий имеющих несколько вариантов
function delUnused(arr, cur, building, codeMsg, code) {
	arr.forEach((el) => {
		if (el == cur) return wrExtra(building._id, null, code, msgB(building, codeMsg), cur ?? 'off')
		delExtra(building._id, null, code, el ?? 'off')
	})
}

module.exports = { fnAlarm, delUnused }
