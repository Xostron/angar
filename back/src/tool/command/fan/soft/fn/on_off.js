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
		const { p } = sensor(idB, idS, obj)
		let on = seS.tcnl < accAuto.cold.tgtTcnl - s.cooling.hysteresisIn && p<=s.fan.maxp
		let off = seS.tcnl > accAuto.cold.tgtTcnl + s.cooling.hysteresisIn
		console.log(99009, p, s.fan.maxp, p<=200,  'on=',on , 'off=', off)
		return { on, off }
	},
}
module.exports =  defOnOff 
