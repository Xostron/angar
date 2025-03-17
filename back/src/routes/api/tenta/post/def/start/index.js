/**
 * Вкл/Выкл склад + форма (настройки сушки, авторежим)
 * @param {*} o данные от web клиента {_id:buildId, value: true/false}
 * @param {*} data данные из файла json
 */
function cb(o, data) {
	// value - вкл/выкл склад (true/false)
	const { buildingId, value } = o
	const { mode: automode, day, fan, product } = o?.obj ?? {}

	// вкл склада
	data[buildingId] ??= {}
	data[buildingId].start = value

	// авторежим
	automode ? (data[buildingId].automode = automode) : null

	// TODO доп настройки Сушки
	// if (product && buildingId) {
	// 	data[buildingId].setting ??= {}
	// 	data[buildingId].setting ??= {}
	// 	data[buildingId].setting.drying ??= {}
	// 	data[buildingId].setting.drying[product] ??= {}
	// 	data[buildingId].setting.drying[product].ventilation ??= {}
	// 	data[buildingId].setting.drying[product].day ??= {}

	// 	data[buildingId].setting.drying[product].ventilation.ventilation = fan
	// 	data[buildingId].setting.drying[product].day.day = day
	// }
	return data
}
/* 
obj = {"buildingId":"65d4aed4b47bb93c40100fd5", "value":false}
obj = {"buildingId":"65d4aed4b47bb93c40100fd5", "value":true}
*/

module.exports = cb
