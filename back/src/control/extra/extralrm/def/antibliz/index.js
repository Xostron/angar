const { set, reset, fnCheck } = require('./fn')
/**
 * @description если за время time, концевик закрыто приточного клапана хлопнул (сработал)
 *  count раз, тогда генерируем аварию (Сработал режим антивьюги) и останов всей секции
 * Сброс аварии по кнопке и после времени ожидания wait
 * @param {*} bld
 * @param {*} sect секция
 * @param {*} obj Данные основного цикла
 * @param {*} s Настройки склада
 * @param {*} se Показания датчиков секции
 * @param {*} m Исполнительные механизмы
 * @param {*} acc Данные о вычисления доп. аварий
 * @param {*} data Данные от авторежима
 * @returns {} alarm:bool Авария, datalog:{дата аварии и текст аварии}, reset:bool сброс аварии
 */
function antibliz(bld, sect, obj, s, se, m, automode, acc, data) {
	// const extraCO2 = readAcc(bld._id, 'building', 'co2')
	// Сбрасываем подсчет при работе удаления СО2
	// if (extraCO2.start) acc.queue = []
	console.log(99, acc)
	if (!fnCheck(bld, sect, obj, m, s, acc)) return false
	// Установка аварии
	set(bld, sect, obj.value, m.vlvS, acc, s)
	// Автосброс аварии
	reset(bld, sect, s, acc)
	return acc?._alarm ?? false
}

module.exports = antibliz
