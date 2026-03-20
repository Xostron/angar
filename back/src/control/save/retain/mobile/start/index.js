/**
 * @description Вкл/Выкл склад + форма (настройки сушки, авторежим)
 * @param {*} acc данные от web клиента {_id:buildId, value: true/false}
 * @param {*} result данные из файла json
 */
function cb(acc, result) {
	const { pcId, buildingId, sectionId, value, obj } = acc
	result[buildingId].start = value

	if (obj === null || obj === undefined) return
	// Авторежим
	if (!!obj?.mode) result[buildingId].automode = obj.mode
	// Выборочные настройки сушки:
	// 1. Постоянный вентилятор
	if (typeof obj.fan === 'boolean' && !!obj.product) {
		result[buildingId].setting ??= {}
		result[buildingId].setting.drying ??= {}
		result[buildingId].setting.drying[obj.product] ??= {}
		result[buildingId].setting.drying[obj.product] ??= {}
		result[buildingId].setting.drying[obj.product].ventilation ??= {}
		result[buildingId].setting.drying[obj.product].ventilation.ventilation = obj.fan
	}
	// 2. Время сушки в днях
	if (typeof obj.day === 'string' && !!obj.product) {
		result[buildingId].setting ??= {}
		result[buildingId].setting.drying ??= {}
		result[buildingId].setting.drying[obj.product] ??= {}
		result[buildingId].setting.drying[obj.product] ??= {}
		result[buildingId].setting.drying[obj.product].day ??= {}
		result[buildingId].setting.drying[obj.product].day.day = obj.day ? obj.day : 0
	}
}
/* 
o = {"buildingId":"65d4aed4b47bb93c40100fd5", "value":false, obj:null}
o = {"buildingId":"65d4aed4b47bb93c40100fd5", "value":true, obj:{}}
*/

module.exports = cb
