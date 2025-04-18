const { data: store } = require('@store')
const relay = require('./relay')
const fc = require('./fc')

/**
 * Плавный пуск/стоп ВНО склада
 * @param {*} bldId Id склада
 * @param {*} obj Глобальные данные склада
 * @param {*} s Настройки склада
 * @param {*} seB Датчики склада
 * @param {*} m Доп. устройства склада
 * @param {*} resultFan Данные о ВНО всего склада
 */
function soft(bldId, obj, s, seB, m, resultFan) {
	// Плавный пуск (все вентиляторы на контакторах)
	if (!resultFan.list?.length) return
	// По секциям
	resultFan.list.forEach((secId, idx) => {
		const aCmd = store.aCmd?.[secId]?.fan
		const fans = resultFan.fan.filter((el) => el.owner.id === secId).sort((a, b) => a?.order - b?.order)
		if (!aCmd) return
		const type = fans[0]?.ao?.id ? 'fc' : 'relay'
		data[type](bldId, secId, obj, aCmd, fans, s, seB, idx)
	})
}

module.exports = soft

const data = {
	// Плавный пуск (все вентиляторы на контакторах)
	relay,
	// Плавный пуск (1 вентилятор на ПЧ, остальные на контакторах)
	fc,
}
