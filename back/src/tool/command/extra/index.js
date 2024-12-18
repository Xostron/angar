const { ctrlB } = require('@tool/command/fan')

function fnAlarm(building, arr, value) {
	arr?.forEach((el) => {
		if (value?.[el._id]?.state === 'alarm') return ctrlB(el, building._id, 'off')
	})
}

module.exports = { fnAlarm }
