const logger = require('@tool/logger')
const { data: store } = require('@store')

function statistic(obj, alr) {
	const { data, value } = obj

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
	// Датчики
	groupLog(data.sensor, value, store.prev, 'sensor')
	// Неисправности
	alarmLog(alr, store.prev)
}

module.exports = statistic

// Логирование периферии
function groupLog(arr, value, prev, level) {
	if (!arr?.length) return
	arr.forEach((el) => {
		const { _id } = el
		if (!value?.[_id]) return
		if (JSON.stringify(value[_id]) === JSON.stringify(prev[_id])) return
		// фиксируем состояние по изменению
		prev[_id] = value[_id]

		if (['cooler', 'aggregate', 'device', 'valve', 'fan'].includes(level)) {
			logger[level]({ _id, message: { state: value[_id]?.state } })
			return
		}
		if (level === 'sensor') {
			logger[level]({ _id, message: { value: value[_id]?.value, state: value[_id]?.state, type: el.type } })
			return
		}
		logger[level]({ _id, message: value[_id] })
	})
}

function alarmLog(arr, prev){
	arr.forEach((el)=>{
		const message = el.title+' '+el.msg
		if (el.date===prev[message]) return
		// фиксируем состояние по изменению
		prev[message] = el.date
		logger['alarm']({ _id:el.buildingId, message })
	})
}