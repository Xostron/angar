const { ctrlV } = require('@tool/command/valve')
const finish = require('./finish')

function start(vlv, state) {
	// Открыт (начинаем отсчет)
	if (vlv._type === 'opn') {
		if (state === 'opn') {
			ctrlV(vlv, vlv._build, 'close')
			if (!vlv?._time1) vlv._time1 = new Date()
		}
		if (state === 'cls') {
			ctrlV(vlv, vlv._build, 'stop')
			if (!vlv?._time2) vlv._time2 = new Date()
			vlv._time = vlv._time2 - vlv._time1
			vlv._stage = 'finish'
			vlv._type = null
			finish(vlv, state)
		}
	}

	// Закрыт (начинаем отсчет)
	if (vlv._type === 'cls') {
		if (state === 'cls') {
			ctrlV(vlv, vlv._build, 'open')
			vlv._time1 ??= new Date()
		}
		if (state === 'opn') {
			ctrlV(vlv, vlv._build, 'stop')
			vlv._time2 ??= new Date()
			vlv._time = vlv._time2 - vlv._time1
			vlv._stage = 'finish'
			vlv._type = null
			finish(vlv, state)
		}
	}
	// console.log('555 start', JSON.stringify(vlv))
}

module.exports = start
