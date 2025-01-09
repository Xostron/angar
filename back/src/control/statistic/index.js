const logger = require('@tool/logger')
const { data: store } = require('@store')

function statistic(obj) {
	const { data, value } = obj
	console.log(555, data.device, value)

	// Вентиляторы
	groupLog(data.fan, value, store.prev, 'fan')
	// Клапан
	groupLog(data.valve, value, store.prev, 'valve')
	// Обогрев
	groupLog(data.heating, value.outputEq, store.prev, 'heating')
	// Холодильник
	groupLog(data.cooler, value, store.prev, 'cooler')
	// Агрегат
	groupLog(data.aggregate, value, store.prev, 'aggregate')
	// Устройства
	groupLog(data.device, value, store.prev, 'device')
}

module.exports = statistic

// Логирование периферии
function groupLog(arr, value, prev, level) {
	if (!arr?.length) return
	arr.forEach(({ _id }) => {
		if (!value?.[_id]) return
		if (JSON.stringify(value[_id]) === JSON.stringify(prev[_id])) return
		// фиксируем состояние по изменению
		prev[_id] = value[_id]

		if (['cooler', 'aggregate', 'device', 'valve', 'fan'].includes(level)) {
			logger[level]({ _id, message: { state: value[_id]?.state } })
			return
		}

		logger[level]({ _id, message: value[_id] })
	})
}
