const { beepD } = require('@tool/beep')

// Аварийные сигналы устройства CO2
function co2(building, section, obj, s, se, m, automode, acc, data) {
	// Оповещения устройства (beep)
	m?.cold?.device?.co2?.forEach((el) => {
		beepD(el, el.beep, obj, building, acc, 65)
	})
	// return acc?.alarm ?? false
}



module.exports = co2
