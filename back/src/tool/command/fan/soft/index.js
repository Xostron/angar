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
function soft(bld, obj, s, seB, seS, m, resultFan, bdata, where) {
	const { section, cooler } = obj.data
	if (!resultFan.list?.length) return
	// Управление цепочкой ВНО - По секциям
	resultFan.list.forEach((idS, idx) => {
		const aCmd = store.aCmd?.[idS]?.fan
		// Испарители, принадлежащие текущей секции
		const coolerIds = cooler.filter((el) => el.sectionId == idS).map((el) => el._id)
		// ВНО испарителей данной секции (управляем ими как обычными ВНО без ПЧ)
		const fansCoo = resultFan.fan
			.filter((el) => coolerIds.includes(el.owner.id))
			.sort((a, b) => a?.order - b?.order)

		// ВНО без ПЧ
		const fans = resultFan.fan
			.filter((el) => el.owner.id === idS && !el?.ao)
			.sort((a, b) => a?.order - b?.order)

		// ВНО с ПЧ
		const fansFC = resultFan.fan
			.filter((el) => el.owner.id === idS && el?.ao)
			.sort((a, b) => a?.order - b?.order)

		// Выделяем главный ВНО с ПЧ (fanFC) и все остальные ВНО
		const fanFC = fansFC?.[0]
		if (fansFC.length > 1) {
			fans.push(...fansFC.slice(1, fansFC.length))
			fans.sort((a, b) => a?.order - b?.order)
		}
		fans.push(...fansCoo)

		// Тип управления: с ПЧ или реле
		const type = fanFC ? 'fc' : 'relay'

		// if (aCmd.type=='off') return
		// Выбор алгоритма управления плавным пуском: ПЧ или релейная
		data[type](bld, idS, obj, aCmd, fanFC, fans, s, seB, seS, idx, bdata, where)
	})
}

module.exports = soft
