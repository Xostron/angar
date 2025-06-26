const { data: store } = require('@store')
const relay = require('./relay')
const fc = require('./fc')
const data = {
	relay, // Плавный пуск (все вентиляторы на контакторах)
	fc, // Плавный пуск (1 вентилятор на ПЧ, остальные на контакторах)
}

/**
 * Плавный пуск/стоп ВНО склада
 * @param {*} bldId Склад
 * @param {*} obj Глобальные данные склада
 * @param {*} s Настройки склада
 * @param {*} seB Датчики склада
 * @param {*} m Доп. устройства склада
 * @param {*} resultFan Данные о ВНО всего склада
 * @param {object} bdata Результат функции scan()
 */
function soft(bld, obj, s, seB,seS, m, resultFan,bdata, where) {
	const { section, cooler } = obj.data
	// Плавный пуск (все вентиляторы на контакторах)
	if (!resultFan.list?.length) return
	// По секциям

	resultFan.list.forEach((idS, idx) => {
		const aCmd = store.aCmd?.[idS]?.fan
		// Испарители, принадлежащие текущей секции
		const coolerIds = cooler.filter((el) => el.sectionId == idS).map((el) => el._id)
		// ВНО данной секции
		const fans = resultFan.fan.filter((el) => el.owner.id === idS).sort((a, b) => a?.order - b?.order)
		// ВНО испарителей данной секции
		const fansCoo = resultFan.fan.filter((el) => coolerIds.includes(el.owner.id)).sort((a, b) => a?.order - b?.order)
		fans.push(...fansCoo)
		if (!aCmd) return
		// Выбор алгоритма управления плавным пуском: ПЧ или релейная
		const type = fans[0]?.ao?.id ? 'fc' : 'relay'
		data[type](bld, idS, obj, aCmd, fans, s, seB,seS, idx, bdata,where)
	})
}

module.exports = soft
