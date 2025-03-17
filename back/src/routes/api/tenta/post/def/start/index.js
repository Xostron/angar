/**
 * @description Вкл/Выкл склад + форма (настройки сушки, авторежим)
 * @param {*} o данные от web клиента {_id:buildId, value: true/false}
 * @param {*} data данные из файла json
 */
function cb(o, data) {
	// value - вкл/выкл склад (true/false)
	const { buildingId, value } = o
	const { mode: automode, day, fan, product } = o?.obj ?? {}

	// Вкл/выкл склада
	data[buildingId] ??= {}
	data[buildingId].start = value

	// Авторежим
	automode ? (data[buildingId].automode = automode) : null

	// Доп настройки Сушки
	if (product && buildingId) {
		data[buildingId].setting ??= {}
		data[buildingId].setting ??= {}
		data[buildingId].setting.drying ??= {}
		data[buildingId].setting.drying[product] ??= {}
		data[buildingId].setting.drying[product].ventilation ??= {}
		data[buildingId].setting.drying[product].day ??= {}

		data[buildingId].setting.drying[product].ventilation.ventilation = fan
		data[buildingId].setting.drying[product].day.day = day
	}
	return data
}
/* 
o = {"buildingId":"65d4aed4b47bb93c40100fd5", "value":false, obj:null}
o = {"buildingId":"65d4aed4b47bb93c40100fd5", "value":true, obj:{}}
*/

module.exports = cb
