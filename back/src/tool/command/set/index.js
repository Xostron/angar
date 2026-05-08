const { data } = require('@store')

// Команда управления
function setACmd(type, sectionId, obj) {
	data.aCmd ??= {}
	data.aCmd[sectionId] ??= {}
	data.aCmd[sectionId][type] ??= {}
	data.aCmd[sectionId][type] = { ...data.aCmd?.[sectionId]?.[type], ...obj }
}
// Калибровочное время клапана
function setTuneTime(obj) {
	if (obj === null) {
		data.tuneTime = null
		return
	}
	data.tuneTime ??= {}
	data.tuneTime[obj._build] ??= {}
	data.tuneTime[obj._build][obj._id] = obj._time
}
// Установить позиции клапанов
function setPos(obj) {
	if (obj === null) {
		data.vlvPos = null
		return
	}
	data.vlvPos ??= {}
	data.vlvPos[obj._build] ??= {}
	data.vlvPos[obj._build][obj._id] = obj.value
}
// Установить команды управления
function setCmd(obj) {
	if (!obj) {
		data.command = null
		return
	}
	data.command ??= {}
	for (const idB in obj) {
		// Простая проверка, проход только по ключам ObjectId
		if (idB?.length < data.oidLength) continue
		data.command[idB] ??= {}
		for (const idM in obj[idB]) {
			data.command[idB][idM] ??= {}
			for (const channel in obj[idB][idM]) {
				const val = obj[idB][idM][channel]
				data.command[idB][idM][channel] = val
			}
		}
	}
}
// Установить команды управления (включение по времени)
function setCmdT(obj) {
	if (!obj) return
	data.commandT ??= {}
	for (const build in obj) {
		data.commandT[build] ??= {}
		for (const mdl in obj[build]) {
			data.commandT[build][mdl] ??= {}
			for (const channel in obj[build][mdl]) {
				const o = obj[build][mdl][channel]
				data.commandT[build][mdl][channel] = o
			}
		}
	}
}
// Установить команды на калибровку клапанов
function setTune(obj) {
	data.tune = { ...data.tune, ...obj }
}

module.exports = { setCmd, setTune, setCmdT, setPos, setTuneTime, setACmd }
