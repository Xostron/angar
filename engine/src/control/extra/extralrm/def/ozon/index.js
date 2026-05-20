const { delExtra, wrExtra } = require('@tool/message/extra')
const { msgB } = require('@tool/message')
const { getOzon } = require('../../../extra/def/ozon_normal_combi/fn/prepare')

/**
 * Сообщение озонатор не готов к работе
 * @param {*} bld Рама склада
 * @param {*} sect Рама секции
 * @param {*} obj Глобальный объект цикла
 * @param {*} s Настройки склада
 * @param {*} se Показания датчиков секции
 * @param {*} m Исполнительные механизмы
 * @param {*} acc Данные о вычисления доп. аварий
 * @param {*} data Данные от авторежима
 * @returns
 */
function ozon(bld, sect, obj, s, se, m, automode, acc, data) {
	const oz = getOzon(bld, obj, m)
	let reason = m.ozon.length > 1 ? 'выключены автоматы' : 'выключен автомат'
	reason = !!m.ozon.length ? reason : null
	// Если озонаторы неисправны
	if (!oz?.ready && reason !== null)
		wrExtra(bld._id, null, 'ozon3', msgB(bld, 91, `Не готов. По причине: ${reason}`))
	else delExtra(bld._id, null, 'ozon3')
}

module.exports = ozon
