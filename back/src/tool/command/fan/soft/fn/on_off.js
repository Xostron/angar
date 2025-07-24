const { sensor } = require('@tool/command/sensor')

// Команды Вкл/выкл ВНО в зависимости от показателей давления/температуры канала
const defOnOff = {
	// Для обычного склада и комби(обычный режим)
	normal: (idB, idS, accAuto, obj, seS, s) => {
		const { p } = sensor(idB, idS, obj)
		let on = p < s.fan.pressure.p - s.fan.hysteresisP
		let off = p > s.fan.pressure.p + s.fan.hysteresisP
		return { on, off }
	},
	// Комби (режим холодильника)
	cold: (idB, idS, accAuto, obj, seS, s) => {
		let on = seS.tcnl < accAuto.cold.tgtTcnl - s.cooling.hysteresisIn
		let off = seS.tcnl > accAuto.cold.tgtTcnl + s.cooling.hysteresisIn
		return { on, off }
	},
}
module.exports =  defOnOff 
