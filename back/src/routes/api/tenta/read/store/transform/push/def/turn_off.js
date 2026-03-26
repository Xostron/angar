const { getSectAM } = require('@tool/get/building')

/**
 * Cекции и склад выключены - запрет отправки пушей
 * @param {*} idB ИД Склада
 * @param {*} obj Глобальные данные
 * @returns {boolean} true - запрет отправки уведомлений
 */
function turnOff(idB, section, obj) {
	const sectAM = getSectAM(idB, section, obj)
	const start = obj?.retain?.[idB]?.start
	console.log(9991, sectAM, 'Блокировка пуш', !sectAM?.length && !start)
	return !sectAM?.length && !start
}

module.exports = turnOff
