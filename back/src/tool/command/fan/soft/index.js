const { data: store } = require('@store')
const relay = require('./relay')

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
		// Плавный пуск (все вентиляторы на контакторах)
		relay(bldId, secId, obj, aCmd, fans, s, seB, idx)
		// Плавный пуск (1 вентилятор на ПЧ, остальные на контакторах)
	})
}

module.exports = soft
