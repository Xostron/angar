const { sensor } = require('@tool/command/sensor')

// Команды Вкл/выкл ВНО в зависимости от показателей давления/температуры канала
const defOnOff = {
	// Для обычного склада и комби(обычный режим)
	normal: (idB, idS, accAuto, obj, seS, s) => {
		const { p } = sensor(idB, idS, obj)
		let on = p < s.fan.pressure.p
		let off = p > s.fan.pressure.p + s.fan.hysteresisP
		// console.log('\tТаблица. Режим Обычный: Сигнал на вкл/выкл ВНО, Секция', idS)
		// console.table(
		// 	[
		// 		{
		// 			on,
		// 			off,
		// 			Давление_канала: p,
		// 			Задание_давления: s.fan.pressure.p,
		// 			Гистерезис: s.fan.hysteresisPб,
		// 		},
		// 	],
		// 	['on', 'off', 'Давление_канала', 'Задание_давления', 'Гистерезис']
		// )
		return { on, off }
	},
	// Комби (режим холодильника)
	cold: (idB, idS, accAuto, obj, seS, s) => {
		const { p } = sensor(idB, idS, obj)
		let on = seS.tcnl < accAuto.cold.tgtTcnl - s.cooling.hysteresisIn && p <= s.fan.maxp
		let off = seS.tcnl >= accAuto.cold.tgtTcnl
		// console.log('\tТаблица. Режим Холодильник: Сигнал на вкл/выкл ВНО, Секция', idS)
		// console.table(
		// 	[
		// 		{
		// 			on,
		// 			off,
		// 			Тканала: seS.tcnl,
		// 			Tзад_кан: accAuto.cold.tgtTcnl,
		// 			Гистерезис: s.cooling.hysteresisIn,
		// 			Pкан_Па: p,
		// 			Макс_P: s.fan.maxp,
		// 		},
		// 	],
		// 	['on', 'off', 'Тканала', 'Tзад_кан', 'Гистерезис', 'Pкан_Па', 'Макс_P']
		// )
		return { on, off }
	},
}
module.exports = defOnOff
