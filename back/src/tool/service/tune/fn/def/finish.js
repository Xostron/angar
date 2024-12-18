const { setTuneTime } = require('@store')

function finish(vlv, state) {
	vlv._stage = null
	// Сохраняем настройки калибровки в retain/*.json
	setTuneTime(vlv)
	console.log('666 FINISH Tune-up', vlv)
}

module.exports = finish
