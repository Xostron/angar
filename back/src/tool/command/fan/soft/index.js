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
 * @param {} solHeatS соленоид подгрева испарителей
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
		let fansCoo = resultFan.fan
			.filter((el) => coolerIds.includes(el.owner.id) && el.type == 'fan')
			.sort((a, b) => a?.order - b?.order)
		// Соленоиды подогрева
		const solHeat = resultFan.fan.filter((el) => el.type == 'channel')
		// ВНО без ПЧ
		const fans = resultFan.fan
			.filter((el) => el.owner.id === idS && !el?.ao && el.type == 'fan')
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
		// Обычные ВНО + ВНО испарителей
		fans.push(...fansCoo)
		// Тип управления: с ПЧ или реле
		const type = fanFC ? 'fc' : 'relay'
		// Выбор алгоритма управления плавным пуском: ПЧ или релейная
		// console.log('******НАЧАЛО Плавный пуск ВНО')
		// console.table(
		// 	[{ Секция: idS, 'Тип ВНО': type, 'Тип управления': where }],
		// 	['Секция', 'Тип ВНО', 'Тип управления']
		// )
		data[type](bld, idS, obj, aCmd, fanFC, fans, solHeat, s, seB, seS, idx, bdata, where)
	})
}

module.exports = soft
