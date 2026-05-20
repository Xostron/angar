const { setTuneTime } = require('@tool/command/set')

function finish(vlv, state) {
	vlv._stage = null
	// Сохраняем настройки калибровки в retain/*.json
	setTuneTime(vlv)
}

module.exports = finish
